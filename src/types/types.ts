// MOSI-OA TUNYA AWARDS — Type Definitions

export type UserRole = 'admin' | 'moderator' | 'user';
export type Status = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
export type PaymentType = 'registration' | 'voting';
export type MediaType = 'image' | 'video';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  province?: string;
  city?: string;
  role: UserRole;
  is_suspended: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
  nominee_count?: number;
}

export interface Nominee {
  id: string;
  user_id?: string;
  full_name: string;
  stage_name?: string;
  category_id: string;
  biography?: string;
  phone?: string;
  email: string;
  province?: string;
  district?: string;
  profile_picture_url?: string;
  banner_image_url?: string;
  gallery_urls?: string[];
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
  whatsapp?: string;
  payment_proof_url?: string;
  status: Status;
  rejection_reason?: string;
  is_featured: boolean;
  vote_count: number;
  is_winner: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface Sponsor {
  id: string;
  company_name: string;
  logo_url?: string;
  rep_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  package?: string;
  description?: string;
  banner_url?: string;
  status: Status;
  is_featured: boolean;
  created_at: string;
}

export interface Partner {
  id: string;
  org_name: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  rep_name?: string;
  status: Status;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  payment_type: PaymentType;
  nominee_id?: string;
  amount: number;
  votes_count?: number;
  status: Status;
  notes?: string;
  transaction_ref: string;
  phone?: string;
  lipila_reference?: string;
  transaction_id?: string;
  payment_method?: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  nominees?: Nominee;
}

export interface Vote {
  id: string;
  user_id: string;
  nominee_id: string;
  category_id: string;
  votes_count: number;
  payment_id?: string;
  created_at: string;
  profiles?: Profile;
  nominees?: Nominee;
  categories?: Category;
}

export interface News {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  image_url?: string;
  is_published: boolean;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  media_url: string;
  media_type: MediaType;
  category?: string;
  sort_order: number;
  created_at: string;
}

export interface SiteSettings {
  // General
  website_name: string;
  site_name: string;
  header_text: string;
  awards_night_date: string;
  awards_date: string;
  logo_url: string;
  favicon_url: string;
  about_text: string;
  about_content: string;
  footer_text: string;
  currency: string;
  currency_code: string;
  // Social
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  twitter_url: string;
  // SEO
  meta_title: string;
  meta_description: string;
  ga_tracking_id: string;
  // Payment
  voting_fee: number;
  nomination_fee: number;
  payments_enabled: boolean;
  mobile_money_number: string;
  account_name: string;
  bank_name: string;
  bank_account: string;
  payment_instructions: string;
  payment_qr_url: string;
  manual_verification: boolean;
  payment_methods: string[];
  // Payment Gateways & Modes
  payment_mode: 'automatic' | 'manual';
  lipila_enabled: boolean;
  lipila_sandbox: boolean;
  lipila_api_key: string;
  lipila_account_id: string;
  lipila_webhook_secret: string;
  lipila_currency: string;
  lipila_timeout: number;
  lipila_retry_attempts: number;
  mtn_enabled: boolean;
  airtel_enabled: boolean;
  zamtel_enabled: boolean;
  cards_enabled: boolean;

  // Contact & Links
  quick_links: string;
  support_links: string;
  office_address: string;
  help_email: string;
  help_number: string;
  contact_email: string;
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  
  // Voting Config
  vote_min_quantity: number;
  vote_max_quantity: number;
  voting_start_date: string;
  voting_end_date: string;
  voting_status: 'open' | 'closed';
  vote_discounts: boolean;
  vote_taxes: number;

  // Email / SMTP
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_encryption: string;
  email_from: string;
  email_from_name: string;
  // Notifications
  notify_user_register: boolean;
  notify_vote_confirm: boolean;
  notify_nominee_register: boolean;
  notify_nominee_approved: boolean;
  notify_sponsor_approved: boolean;
  notify_partner_approved: boolean;
  notify_admin_new_payment: boolean;
  notify_admin_new_nominee: boolean;
  // Security
  rate_limiting_enabled: boolean;
  captcha_enabled: boolean;
  audit_log_enabled: boolean;
  maintenance_mode: boolean;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  profiles?: Profile;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_nominees: number;
  total_categories: number;
  total_votes: number;
  total_revenue: number;
  today_votes: number;
  today_revenue: number;
  pending_payments: number;
  approved_payments: number;
  total_sponsors: number;
  total_partners: number;
  votes_by_category: { category: string; votes: number }[];
  monthly_revenue: { month: string; revenue: number }[];
  top_nominees: { name: string; votes: number }[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
