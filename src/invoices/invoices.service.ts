import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private supabaseService: SupabaseService) {}

  private async getAppUserId(authUserId: string): Promise<string> {
    const supabase = this.supabaseService.getClient();

    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authUserId)
      .single();

    if (!data?.id) {
      throw new ForbiddenException('Utilisateur non enregistré');
    }

    return data.id;
  }

  async createInvoice(userId: string, createInvoiceDto: CreateInvoiceDto) {
    const supabase = this.supabaseService.getClient();

    // Vérifier l'accès à l'organisation
    await this.verifyOrganizationAccess(userId, createInvoiceDto.organization_id);

    // Recalculer les totaux côté backend pour éviter la falsification
    let total_ht = 0;
    const itemsWithTotals = createInvoiceDto.items.map((item) => {
      const line_total = item.quantity * item.unit_price;
      total_ht += line_total;
      return {
        ...item,
        line_total,
      };
    });

    const total_vat = total_ht * (createInvoiceDto.vat_rate / 100);
    const total_ttc = total_ht + total_vat;

    // Générer un numéro de facture pour l'organisation
    const invoice_number = await this.generateInvoiceNumber(createInvoiceDto.organization_id, createInvoiceDto.type);

    // Obtenir la séquence
    const { data: maxSeq } = await supabase
      .from('invoices')
      .select('invoice_sequence')
      .eq('organization_id', createInvoiceDto.organization_id)
      .eq('type', createInvoiceDto.type)
      .order('invoice_sequence', { ascending: false })
      .limit(1)
      .single();

    const invoice_sequence = (maxSeq?.invoice_sequence || 0) + 1;

    // Insérer la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        organization_id: createInvoiceDto.organization_id,
        type: createInvoiceDto.type,
        invoice_number,
        invoice_sequence,
        vat_rate: createInvoiceDto.vat_rate,
        total_ht,
        total_vat,
        total_ttc,
        client_name: createInvoiceDto.client_name,
        client_address: createInvoiceDto.client_address,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Insérer les lignes
    const itemsToInsert = itemsWithTotals.map((item) => ({
      invoice_id: invoice.id,
      designation: item.designation,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return this.getInvoiceById(userId, invoice.id);
  }

  async getInvoices(userId: string, organizationId?: string) {
    const supabase = this.supabaseService.getClient();
    const appUserId = await this.getAppUserId(userId);

    // Récupérer les organisations auxquelles l'utilisateur a accès
    const { data: userOrgs, error: orgsError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', appUserId);

    if (orgsError) throw orgsError;

    const accessibleOrgIds = userOrgs?.map(uo => uo.organization_id) || [];

    if (accessibleOrgIds.length === 0) {
      return []; // Aucune organisation, donc aucune facture
    }

    let query = supabase
      .from('invoices')
      .select('*')
      .in('organization_id', accessibleOrgIds)
      .order('created_at', { ascending: false });

    if (organizationId) {
      // Vérifier que l'utilisateur a accès à cette organisation spécifique
      if (!accessibleOrgIds.includes(organizationId)) {
        throw new ForbiddenException('Accès interdit à cette organisation');
      }
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async getInvoiceById(userId: string, invoiceId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new NotFoundException('Facture introuvable');
    }

    // Vérifier l'accès à l'organisation de la facture
    await this.verifyOrganizationAccess(userId, invoice.organization_id);

    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    if (itemsError) throw itemsError;

    return {
      ...invoice,
      items,
    };
  }

  async updateInvoice(userId: string, invoiceId: string, updateInvoiceDto: UpdateInvoiceDto) {
    const supabase = this.supabaseService.getClient();

    // Vérifier que la facture existe
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('organization_id, invoice_number')
      .eq('id', invoiceId)
      .single();

    if (!existingInvoice) {
      throw new NotFoundException('Facture introuvable');
    }

    // Vérifier l'accès à l'organisation
    await this.verifyOrganizationAccess(userId, existingInvoice.organization_id);

    // Recalculer les totaux
    let total_ht = 0;
    const itemsWithTotals = updateInvoiceDto.items.map((item) => {
      const line_total = item.quantity * item.unit_price;
      total_ht += line_total;
      return {
        ...item,
        line_total,
      };
    });

    const total_vat = total_ht * (updateInvoiceDto.vat_rate / 100);
    const total_ttc = total_ht + total_vat;

    // Mettre à jour la facture
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        organization_id: updateInvoiceDto.organization_id,
        type: updateInvoiceDto.type,
        vat_rate: updateInvoiceDto.vat_rate,
        total_ht,
        total_vat,
        total_ttc,
        client_name: updateInvoiceDto.client_name,
        client_address: updateInvoiceDto.client_address,
      })
      .eq('id', invoiceId);

    if (updateError) throw updateError;

    // Supprimer les anciens items
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);

    // Insérer les nouveaux items
    const itemsToInsert = itemsWithTotals.map((item) => ({
      invoice_id: invoiceId,
      designation: item.designation,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return this.getInvoiceById(userId, invoiceId);
  }

  async deleteInvoice(userId: string, invoiceId: string) {
    const supabase = this.supabaseService.getClient();

    // Vérifier que la facture existe
    const { data: invoice } = await supabase
      .from('invoices')
      .select('organization_id')
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      throw new NotFoundException('Facture introuvable');
    }

    // Vérifier l'accès à l'organisation
    await this.verifyOrganizationAccess(userId, invoice.organization_id);

    // Supprimer les items (cascade devrait le faire, mais on s'assure)
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);

    // Supprimer la facture
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) throw error;

    return { message: 'Facture supprimée avec succès' };
  }

  private async generateInvoiceNumber(organizationId: string, type: string): Promise<string> {
    const prefix = type === 'definitive' ? 'INV' : 'PRO';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const supabase = this.supabaseService.getClient();
    const { data: maxSeq } = await supabase
      .from('invoices')
      .select('invoice_sequence')
      .eq('organization_id', organizationId)
      .eq('type', type)
      .order('invoice_sequence', { ascending: false })
      .limit(1)
      .single();

    const sequence = (maxSeq?.invoice_sequence || 0) + 1;
    
    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  private async verifyOrganizationAccess(userId: string, organizationId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const appUserId = await this.getAppUserId(userId);

    const { data } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', appUserId)
      .eq('organization_id', organizationId)
      .single();

    if (!data) {
      throw new ForbiddenException('Accès interdit à cette organisation');
    }
  }
}
