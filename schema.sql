
-- 1. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER', -- 'ADMIN' or 'MEMBER'
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Deposits Table
CREATE TABLE public.deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Loans Table
CREATE TABLE public.loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.profiles(id) NOT NULL,
  total_amount NUMERIC NOT NULL,
  recoverable_amount NUMERIC NOT NULL,
  waiver_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED'
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  term_months INTEGER NOT NULL DEFAULT 6,
  installments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Users can update own basic info" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for Deposits
CREATE POLICY "Deposits are viewable by everyone" ON public.deposits FOR SELECT USING (true);
CREATE POLICY "Only admins can manage deposits" ON public.deposits FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Policies for Loans
CREATE POLICY "Loans are viewable by everyone" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Only admins can manage loans" ON public.loans FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- 5. Trigger for New Auth Users
-- This function runs whenever a user verifies their magic link for the first time
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Member'), 
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'MEMBER'),
    CASE 
      WHEN (new.raw_user_meta_data->>'role') = 'ADMIN' THEN 'APPROVED'
      ELSE 'PENDING'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
