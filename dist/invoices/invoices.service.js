"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let InvoicesService = class InvoicesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getAppUserId(authUserId) {
        const supabase = this.supabaseService.getClient();
        const { data } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', authUserId)
            .single();
        if (!data?.id) {
            throw new common_1.ForbiddenException('Utilisateur non enregistré');
        }
        return data.id;
    }
    async createInvoice(userId, createInvoiceDto) {
        const supabase = this.supabaseService.getClient();
        await this.verifyOrganizationAccess(userId, createInvoiceDto.organization_id);
        let itemsTotal = 0;
        const itemsWithTotals = createInvoiceDto.items.map((item) => {
            const line_total = item.quantity * item.unit_price;
            itemsTotal += line_total;
            return {
                ...item,
                line_total,
            };
        });
        const laborCost = createInvoiceDto.labor_cost || 0;
        const total_ht = itemsTotal + laborCost;
        const total_vat = total_ht * (createInvoiceDto.vat_rate / 100);
        const total_ttc = total_ht + total_vat;
        const invoice_number = await this.generateInvoiceNumber(createInvoiceDto.organization_id, createInvoiceDto.type);
        const { data: maxSeq } = await supabase
            .from('invoices')
            .select('invoice_sequence')
            .eq('organization_id', createInvoiceDto.organization_id)
            .eq('type', createInvoiceDto.type)
            .order('invoice_sequence', { ascending: false })
            .limit(1)
            .single();
        const invoice_sequence = (maxSeq?.invoice_sequence || 0) + 1;
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
            labor_cost: laborCost > 0 ? laborCost : null,
        })
            .select()
            .single();
        if (invoiceError)
            throw invoiceError;
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
        if (itemsError)
            throw itemsError;
        return this.getInvoiceById(userId, invoice.id);
    }
    async getInvoices(userId, organizationId) {
        const supabase = this.supabaseService.getClient();
        const appUserId = await this.getAppUserId(userId);
        const { data: userOrgs, error: orgsError } = await supabase
            .from('user_organizations')
            .select('organization_id')
            .eq('user_id', appUserId);
        if (orgsError)
            throw orgsError;
        const accessibleOrgIds = userOrgs?.map(uo => uo.organization_id) || [];
        if (accessibleOrgIds.length === 0) {
            return [];
        }
        let query = supabase
            .from('invoices')
            .select('*')
            .in('organization_id', accessibleOrgIds)
            .order('created_at', { ascending: false });
        if (organizationId) {
            if (!accessibleOrgIds.includes(organizationId)) {
                throw new common_1.ForbiddenException('Accès interdit à cette organisation');
            }
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data;
    }
    async getInvoiceById(userId, invoiceId) {
        const supabase = this.supabaseService.getClient();
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .single();
        if (invoiceError || !invoice) {
            throw new common_1.NotFoundException('Facture introuvable');
        }
        await this.verifyOrganizationAccess(userId, invoice.organization_id);
        const { data: items, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoiceId);
        if (itemsError)
            throw itemsError;
        return {
            ...invoice,
            items,
        };
    }
    async updateInvoice(userId, invoiceId, updateInvoiceDto) {
        const supabase = this.supabaseService.getClient();
        const { data: existingInvoice } = await supabase
            .from('invoices')
            .select('organization_id, invoice_number')
            .eq('id', invoiceId)
            .single();
        if (!existingInvoice) {
            throw new common_1.NotFoundException('Facture introuvable');
        }
        await this.verifyOrganizationAccess(userId, existingInvoice.organization_id);
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
        if (updateError)
            throw updateError;
        await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
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
        if (itemsError)
            throw itemsError;
        return this.getInvoiceById(userId, invoiceId);
    }
    async deleteInvoice(userId, invoiceId) {
        const supabase = this.supabaseService.getClient();
        const { data: invoice } = await supabase
            .from('invoices')
            .select('organization_id')
            .eq('id', invoiceId)
            .single();
        if (!invoice) {
            throw new common_1.NotFoundException('Facture introuvable');
        }
        await this.verifyOrganizationAccess(userId, invoice.organization_id);
        await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', invoiceId);
        if (error)
            throw error;
        return { message: 'Facture supprimée avec succès' };
    }
    async generateInvoiceNumber(organizationId, type) {
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
    async verifyOrganizationAccess(userId, organizationId) {
        const supabase = this.supabaseService.getClient();
        const appUserId = await this.getAppUserId(userId);
        const { data } = await supabase
            .from('user_organizations')
            .select('role')
            .eq('user_id', appUserId)
            .eq('organization_id', organizationId)
            .single();
        if (!data) {
            throw new common_1.ForbiddenException('Accès interdit à cette organisation');
        }
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map