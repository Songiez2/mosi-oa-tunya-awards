// MOSI-OA TUNYA AWARDS — Supabase API Layer
import { supabase } from '@/db/supabase';
import type {
  Profile, Category, Nominee, Sponsor, Partner, Payment, Vote,
  News, GalleryItem, SiteSettings, AuditLog, ContactMessage,
  Announcement, DashboardStats, PaginatedResult, Status, UserRole
} from '@/types/types';

// ============================================================
// SETTINGS
// ============================================================
export async function getSiteSettings(): Promise<Partial<SiteSettings>> {
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .order('key');
  if (!data) return {};
  return Object.fromEntries(data.map(row => [row.key, row.value])) as Partial<SiteSettings>;
}

export async function updateSiteSetting(key: string, value: unknown): Promise<void> {
  await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
}

export async function updateSiteSettings(settings: Record<string, unknown>): Promise<void> {
  const rows = Object.entries(settings).map(([key, value]) => ({
    key, value, updated_at: new Date().toISOString()
  }));
  await supabase.from('site_settings').upsert(rows);
}

// ============================================================
// AUTH / PROFILES
// ============================================================
export async function getProfile(id: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
  await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function listProfiles(page = 1, pageSize = 20, search = ''): Promise<PaginatedResult<Profile>> {
  let query = supabase.from('profiles').select('*', { count: 'exact' });
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  const { data, count } = await query.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function updateUserRole(id: string, role: UserRole): Promise<void> {
  await supabase.from('profiles').update({ role }).eq('id', id);
}

export async function suspendUser(id: string, suspend: boolean): Promise<void> {
  await supabase.from('profiles').update({ is_suspended: suspend }).eq('id', id);
}

export async function deleteUser(id: string): Promise<void> {
  await supabase.from('profiles').delete().eq('id', id);
}

// ============================================================
// CATEGORIES
// ============================================================
export async function getCategories(enabledOnly = false): Promise<Category[]> {
  let q = supabase.from('categories').select('*').order('sort_order');
  if (enabledOnly) q = q.eq('is_enabled', true);
  const { data } = await q;
  return Array.isArray(data) ? data : [];
}

export async function createCategory(name: string, description?: string): Promise<void> {
  await supabase.from('categories').insert({ name, description });
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  await supabase.from('categories').update(updates).eq('id', id);
}

export async function deleteCategory(id: string): Promise<void> {
  await supabase.from('categories').delete().eq('id', id);
}

// ============================================================
// NOMINEES
// ============================================================
export async function getNominees(page = 1, pageSize = 12, categoryId?: string, search = '', status?: Status): Promise<PaginatedResult<Nominee>> {
  let q = supabase.from('nominees').select('*, categories(id, name)', { count: 'exact' });
  if (categoryId) q = q.eq('category_id', categoryId);
  if (search) q = q.or(`full_name.ilike.%${search}%,stage_name.ilike.%${search}%`);
  if (status) q = q.eq('status', status);
  const { data, count } = await q.order('vote_count', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function getAllNomineesAdmin(page = 1, pageSize = 20, search = '', status?: Status, categoryId?: string): Promise<PaginatedResult<Nominee>> {
  let q = supabase.from('nominees').select('*, categories(id,name)', { count: 'exact' });
  if (search) q = q.or(`full_name.ilike.%${search}%,stage_name.ilike.%${search}%,email.ilike.%${search}%`);
  if (status) q = q.eq('status', status);
  if (categoryId) q = q.eq('category_id', categoryId);
  const { data, count } = await q.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function getNomineeById(id: string): Promise<Nominee | null> {
  const { data } = await supabase.from('nominees').select('*, categories(id,name)').eq('id', id).maybeSingle();
  return data;
}

export async function getFeaturedNominees(): Promise<Nominee[]> {
  const { data } = await supabase.from('nominees').select('*, categories(id,name)').eq('is_featured', true).eq('status', 'approved').order('vote_count', { ascending: false }).limit(6);
  return Array.isArray(data) ? data : [];
}

export async function createNomineeRegistration(nominee: Partial<Nominee>): Promise<{ id: string } | null> {
  const { data } = await supabase.from('nominees').insert(nominee).select('id').maybeSingle();
  return data;
}

export async function updateNominee(id: string, updates: Partial<Nominee>): Promise<void> {
  await supabase.from('nominees').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteNominee(id: string): Promise<void> {
  await supabase.from('nominees').delete().eq('id', id);
}

export async function approveNominee(id: string): Promise<void> {
  await supabase.from('nominees').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id);
}

export async function rejectNominee(id: string, reason?: string): Promise<void> {
  await supabase.from('nominees').update({ status: 'rejected', rejection_reason: reason ?? null, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function featureNominee(id: string, featured: boolean): Promise<void> {
  await supabase.from('nominees').update({ is_featured: featured }).eq('id', id);
}

export async function promoteNomineeAsWinner(id: string, isWinner: boolean): Promise<void> {
  await supabase.from('nominees').update({ is_winner: isWinner, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function adminAddNominee(nominee: Partial<Nominee>): Promise<{ id: string } | null> {
  const { data } = await supabase
    .from('nominees')
    .insert({ ...nominee, status: 'approved', is_featured: false, vote_count: 0 })
    .select('id')
    .maybeSingle();
  return data;
}

export async function getVotersLeaderboard(page = 1, pageSize = 20): Promise<PaginatedResult<{ user_id: string; full_name: string; email: string; total_votes: number; total_amount: number }>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  // aggregate votes by user
  const { data, count } = await supabase
    .from('votes')
    .select('user_id, votes_count, profiles!inner(full_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (!data) return { data: [], total: 0, page, pageSize };
  // group by user_id
  const map = new Map<string, { user_id: string; full_name: string; email: string; total_votes: number; total_amount: number }>();
  data.forEach((v: { user_id: string; votes_count: number; profiles: { full_name: string; email: string } | { full_name: string; email: string }[] | null }) => {
    const existing = map.get(v.user_id);
    const profRaw = v.profiles;
    const prof = Array.isArray(profRaw) ? profRaw[0] : profRaw;
    if (existing) {
      existing.total_votes += v.votes_count;
    } else {
      map.set(v.user_id, {
        user_id: v.user_id,
        full_name: prof?.full_name ?? 'Unknown',
        email: prof?.email ?? '',
        total_votes: v.votes_count,
        total_amount: 0,
      });
    }
  });
  return { data: Array.from(map.values()).sort((a, b) => b.total_votes - a.total_votes), total: count ?? 0, page, pageSize };
}

// ============================================================
// SPONSORS
// ============================================================
export async function getSponsors(featuredOnly = false): Promise<Sponsor[]> {
  let q = supabase.from('sponsors').select('*').eq('status', 'approved').order('is_featured', { ascending: false });
  if (featuredOnly) q = q.eq('is_featured', true);
  const { data } = await q.limit(50);
  return Array.isArray(data) ? data : [];
}

export async function getAllSponsorsAdmin(page = 1, pageSize = 20, search = '', status?: Status): Promise<PaginatedResult<Sponsor>> {
  let q = supabase.from('sponsors').select('*', { count: 'exact' });
  if (search) q = q.ilike('company_name', `%${search}%`);
  if (status) q = q.eq('status', status);
  const { data, count } = await q.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}
// Alias for admin pages
export const getSponsorsAdmin = getAllSponsorsAdmin;

export async function createSponsor(sponsor: Partial<Sponsor>): Promise<void> {
  await supabase.from('sponsors').insert(sponsor);
}

export async function updateSponsor(id: string, updates: Partial<Sponsor>): Promise<void> {
  await supabase.from('sponsors').update(updates).eq('id', id);
}

export async function deleteSponsor(id: string): Promise<void> {
  await supabase.from('sponsors').delete().eq('id', id);
}

export async function approveSponsor(id: string): Promise<void> {
  await supabase.from('sponsors').update({ status: 'approved' }).eq('id', id);
}

export async function rejectSponsor(id: string): Promise<void> {
  await supabase.from('sponsors').update({ status: 'rejected' }).eq('id', id);
}

export async function featureSponsor(id: string, featured: boolean): Promise<void> {
  await supabase.from('sponsors').update({ is_featured: featured }).eq('id', id);
}

// ============================================================
// PARTNERS
// ============================================================
export async function getPartners(): Promise<Partner[]> {
  const { data } = await supabase.from('partners').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(50);
  return Array.isArray(data) ? data : [];
}

export async function getAllPartnersAdmin(page = 1, pageSize = 20, search = '', status?: Status): Promise<PaginatedResult<Partner>> {
  let q = supabase.from('partners').select('*', { count: 'exact' });
  if (search) q = q.ilike('org_name', `%${search}%`);
  if (status) q = q.eq('status', status);
  const { data, count } = await q.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}
// Alias for admin pages
export const getPartnersAdmin = getAllPartnersAdmin;

export async function createPartner(partner: Partial<Partner>): Promise<void> {
  await supabase.from('partners').insert(partner);
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
  await supabase.from('partners').update(updates).eq('id', id);
}

export async function deletePartner(id: string): Promise<void> {
  await supabase.from('partners').delete().eq('id', id);
}

export async function approvePartner(id: string): Promise<void> {
  await supabase.from('partners').update({ status: 'approved' }).eq('id', id);
}

export async function rejectPartner(id: string): Promise<void> {
  await supabase.from('partners').update({ status: 'rejected' }).eq('id', id);
}

// ============================================================
// PAYMENTS
// ============================================================
export async function getPayments(page = 1, pageSize = 20, search = '', status?: Status, type?: string): Promise<PaginatedResult<Payment>> {
  let q = supabase.from('payments').select('*, profiles(full_name,email), nominees(full_name)', { count: 'exact' });
  if (status) q = q.eq('status', status);
  if (type) q = q.eq('payment_type', type);
  if (search) q = q.or(`transaction_ref.ilike.%${search}%`);
  const { data, count } = await q.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  const { data } = await supabase.from('payments').select('*, nominees(full_name,stage_name)').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return Array.isArray(data) ? data : [];
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const { data } = await supabase.from('payments').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function createPayment(payment: Partial<Payment>): Promise<{ id: string; transaction_ref: string } | null> {
  const { data } = await supabase.from('payments').insert(payment).select('id, transaction_ref').maybeSingle();
  return data;
}

export async function createLipilaPayment(params: {
  phone: string;
  nominee_id: string;
  user_id?: string;
  email?: string;
  votes_count?: number;
}): Promise<{ payment: Payment; lipila: Record<string, unknown> } | null> {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: params,
  });
  if (error) throw error;
  return data;
}

export async function pollPaymentStatus(paymentId: string, maxAttempts = 30, interval = 3000): Promise<Payment> {
  for (let i = 0; i < maxAttempts; i++) {
    const payment = await getPaymentById(paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.status === 'completed' || payment.status === 'failed') {
      return payment;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Payment status check timeout');
}

export async function approvePayment(id: string): Promise<void> {
  const { error } = await supabase.rpc('approve_payment', { payment_id_param: id });
  if (error) throw error;
}

export async function rejectPayment(id: string, notes?: string): Promise<void> {
  await supabase.from('payments').update({ status: 'rejected', notes: notes ?? null, updated_at: new Date().toISOString() }).eq('id', id);
}

// ============================================================
// VOTES
// ============================================================
export async function getVotes(page = 1, pageSize = 20, nomineeId?: string, categoryId?: string): Promise<PaginatedResult<Vote>> {
  let q = supabase.from('votes').select('*, profiles(full_name,email), nominees(full_name), categories(name)', { count: 'exact' });
  if (nomineeId) q = q.eq('nominee_id', nomineeId);
  if (categoryId) q = q.eq('category_id', categoryId);
  const { data, count } = await q.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function getUserVotes(userId: string): Promise<Vote[]> {
  const { data } = await supabase.from('votes').select('*, nominees(full_name,stage_name), categories(name)').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
  return Array.isArray(data) ? data : [];
}

export async function deleteVote(id: string): Promise<void> {
  await supabase.from('votes').delete().eq('id', id);
}

// Aliases for admin report exports
export const getAllUsersAdmin = listProfiles;
export const getAllPaymentsAdmin = getPayments;
export const getAllVotesAdmin = getVotes;

// ============================================================
// NEWS
// ============================================================
export async function getNews(page = 1, pageSize = 9): Promise<PaginatedResult<News>> {
  const { data, count } = await supabase.from('news').select('*', { count: 'exact' }).eq('is_published', true).order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function getAllNewsAdmin(page = 1, pageSize = 20): Promise<PaginatedResult<News>> {
  const { data, count } = await supabase.from('news').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function getNewsById(id: string): Promise<News | null> {
  const { data } = await supabase.from('news').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function createNews(article: Partial<News>): Promise<void> {
  await supabase.from('news').insert(article);
}

export async function updateNews(id: string, updates: Partial<News>): Promise<void> {
  await supabase.from('news').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteNews(id: string): Promise<void> {
  await supabase.from('news').delete().eq('id', id);
}

// ============================================================
// GALLERY
// ============================================================
export async function getGallery(page = 1, pageSize = 20): Promise<PaginatedResult<GalleryItem>> {
  const { data, count } = await supabase.from('gallery').select('*', { count: 'exact' }).order('sort_order').order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function createGalleryItem(item: Partial<GalleryItem>): Promise<void> {
  await supabase.from('gallery').insert(item);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await supabase.from('gallery').delete().eq('id', id);
}

// ============================================================
// ANNOUNCEMENTS / FAQ
// ============================================================
export async function getAnnouncements(activeOnly = true): Promise<Announcement[]> {
  let q = supabase.from('announcements').select('*').order('created_at', { ascending: false });
  if (activeOnly) q = q.eq('is_active', true);
  const { data } = await q.limit(20);
  return Array.isArray(data) ? data : [];
}

export async function createAnnouncement(item: Partial<Announcement>): Promise<void> {
  await supabase.from('announcements').insert(item);
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<void> {
  await supabase.from('announcements').update(updates).eq('id', id);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await supabase.from('announcements').delete().eq('id', id);
}

// ============================================================
// CONTACT MESSAGES
// ============================================================
export async function sendContactMessage(msg: { name: string; email: string; phone?: string; message: string }): Promise<void> {
  await supabase.from('contact_messages').insert(msg);
}

export async function getContactMessages(page = 1, pageSize = 20): Promise<PaginatedResult<ContactMessage>> {
  const { data, count } = await supabase.from('contact_messages').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function markMessageRead(id: string): Promise<void> {
  await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
}

// ============================================================
// AUDIT LOGS
// ============================================================
export async function getAuditLogs(page = 1, pageSize = 20): Promise<PaginatedResult<AuditLog>> {
  const { data, count } = await supabase.from('audit_logs').select('*, profiles(full_name,email)', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  return { data: Array.isArray(data) ? data : [], total: count ?? 0, page, pageSize };
}

export async function logAction(action: string, entityType?: string, entityId?: string, details?: Record<string, unknown>): Promise<void> {
  await supabase.from('audit_logs').insert({ action, entity_type: entityType, entity_id: entityId, details });
}

// ============================================================
// DASHBOARD STATS
// ============================================================
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10);
  const [users, nominees, categories, votes, revenue, todayVotes, todayRevenue, pendingPayments, approvedPayments, sponsors, partners] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('nominees').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('is_enabled', true),
    supabase.from('votes').select('votes_count'),
    supabase.from('payments').select('amount').eq('status', 'approved'),
    supabase.from('votes').select('votes_count').gte('created_at', today),
    supabase.from('payments').select('amount').eq('status', 'approved').gte('created_at', today),
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('sponsors').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('partners').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
  ]);
  const totalVotesCount = (votes.data ?? []).reduce((s, v) => s + (v.votes_count || 0), 0);
  const totalRevenue = (revenue.data ?? []).reduce((s, p) => s + (p.amount || 0), 0);
  const todayVotesCount = (todayVotes.data ?? []).reduce((s, v) => s + (v.votes_count || 0), 0);
  const todayRevenueTotal = (todayRevenue.data ?? []).reduce((s, p) => s + (p.amount || 0), 0);
  return {
    total_users: users.count ?? 0,
    total_nominees: nominees.count ?? 0,
    total_categories: categories.count ?? 0,
    total_votes: totalVotesCount,
    total_revenue: totalRevenue,
    today_votes: todayVotesCount,
    today_revenue: todayRevenueTotal,
    pending_payments: pendingPayments.count ?? 0,
    approved_payments: approvedPayments.count ?? 0,
    total_sponsors: sponsors.count ?? 0,
    total_partners: partners.count ?? 0,
    votes_by_category: [],
    monthly_revenue: [],
    top_nominees: [],
  };
}

export async function getVotesByCategory(): Promise<{ name: string; votes: number }[]> {
  const { data } = await supabase.from('nominees').select('vote_count, categories(name)').eq('status', 'approved').order('vote_count', { ascending: false });
  if (!data) return [];
  const map: Record<string, number> = {};
  data.forEach(n => {
    const catField = n.categories;
    const cat = (Array.isArray(catField) ? (catField[0] as { name: string } | null)?.name : (catField as { name: string } | null)?.name) ?? 'Unknown';
    map[cat] = (map[cat] || 0) + (n.vote_count || 0);
  });
  return Object.entries(map).map(([name, votes]) => ({ name: name.replace(' Award', '').replace(' of the Year', ''), votes })).sort((a, b) => b.votes - a.votes).slice(0, 10);
}

export async function getTopNominees(limit = 10): Promise<Nominee[]> {
  const { data } = await supabase.from('nominees').select('*, categories(name)').eq('status', 'approved').order('vote_count', { ascending: false }).limit(limit);
  return Array.isArray(data) ? data : [];
}

// ============================================================
// STORAGE UPLOAD
// ============================================================
export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  const safeName = path.replace(/[^a-z0-9_.\-/]/gi, '_').toLowerCase();
  const { data, error } = await supabase.storage.from(bucket).upload(safeName, file, { upsert: true, contentType: file.type });
  if (error || !data) return null;
  const { data: url } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return url.publicUrl;
}
