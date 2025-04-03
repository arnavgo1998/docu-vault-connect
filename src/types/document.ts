
export interface Document {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  provider: string;
  policy_number?: string;
  premium_amount?: string;
  coverage_amount?: string;
  start_date?: string;
  end_date?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  upload_date: string;
  shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentEdit {
  id: string;
  document_id: string;
  editor_id: string;
  edit_type: string;
  previous_value?: any;
  new_value?: any;
  edited_at: string;
}

export interface SharedDocument {
  id: string;
  document_id: string;
  shared_with_id: string;
  shared_by_id: string;
  shared_at: string;
}
