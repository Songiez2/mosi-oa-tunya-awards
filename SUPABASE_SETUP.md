# Supabase & Lipila Payment Setup Guide

Since you want full control over your database and payments, follow these steps to connect your own Supabase instance and enable Lipila automatic payments.

## Phase 1: Connect Your Own Supabase

1. **Create a Project**: Go to [Supabase](https://supabase.com) and create a new project.
2. **Setup Database**: 
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Copy the contents of the `schema.sql` file (included in this folder) and paste it into the editor.
   - Click **Run** to create all the necessary tables for the awards platform.
3. **Get Your Keys**:
   - Go to **Project Settings -> API**.
   - Copy the `Project URL` and the `anon / public` API key.
4. **Update App Credentials**:
   - Open your project folder and edit the `.env` file.
   - Replace the existing keys with your own:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-long-anon-key
     ```

## Phase 2: Setup Lipila Payments (Automatic Mobile Money)

To process automatic payments via Zambian mobile networks, we use a Supabase Edge Function that connects to the Lipila API.

1. **Install Supabase CLI** (if you haven't already):
   ```bash
   npm install -g supabase
   ```
2. **Login to Supabase CLI**:
   ```bash
   supabase login
   ```
3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-id
   ```
4. **Set Lipila Secret Keys**:
   Add your Lipila API keys to your Supabase project securely:
   ```bash
   supabase secrets set LIPILA_API_KEY=your_api_key_here
   supabase secrets set LIPILA_ACCOUNT_ID=your_account_id_here
   ```
   *(You can find these in your Lipila Developer Dashboard).*
5. **Deploy the Payment Function**:
   We have already written the Edge Function for you. Deploy it by running:
   ```bash
   supabase functions deploy lipila-payment
   ```

## Phase 3: Finalizing Setup
Once the function is deployed and the database is linked, your app will automatically route voting and registration payment requests through the `lipila-payment` function to prompt the user's phone for mobile money PIN entry!
