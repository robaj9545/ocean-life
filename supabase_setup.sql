-- 1. Create the base profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create coins table (1-to-1 with profiles)
CREATE TABLE IF NOT EXISTS public.coins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    amount INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Create level table (1-to-1 with profiles)
CREATE TABLE IF NOT EXISTS public.level (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    value INTEGER DEFAULT 1 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Create xp table (1-to-1 with profiles)
CREATE TABLE IF NOT EXISTS public.xp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    amount INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Create fishes table (1-to-many with profiles)
CREATE TABLE IF NOT EXISTS public.fishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    species TEXT NOT NULL,
    rarity TEXT NOT NULL,
    color TEXT NOT NULL,
    size REAL NOT NULL,
    speed REAL NOT NULL,
    hunger REAL NOT NULL,
    happiness REAL NOT NULL,
    age REAL NOT NULL,
    position_x REAL NOT NULL,
    position_y REAL NOT NULL,
    direction REAL NOT NULL,
    stage TEXT,
    health REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Create dead_fishes table (1-to-many with profiles)
CREATE TABLE IF NOT EXISTS public.dead_fishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    species TEXT NOT NULL,
    rarity TEXT NOT NULL,
    color TEXT NOT NULL,
    size REAL NOT NULL,
    speed REAL NOT NULL,
    hunger REAL NOT NULL,
    happiness REAL NOT NULL,
    age REAL NOT NULL,
    position_x REAL NOT NULL,
    position_y REAL NOT NULL,
    direction REAL NOT NULL,
    stage TEXT,
    health REAL,
    death_time BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS logic for new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dead_fishes ENABLE ROW LEVEL SECURITY;

-- Create Policies (Only users can access and modify their own data)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own coins" ON public.coins;
CREATE POLICY "Users can view own coins" ON public.coins FOR SELECT USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users can update own coins" ON public.coins;
CREATE POLICY "Users can update own coins" ON public.coins FOR UPDATE USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users can insert own coins" ON public.coins;
CREATE POLICY "Users can insert own coins" ON public.coins FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view own level" ON public.level;
CREATE POLICY "Users can view own level" ON public.level FOR SELECT USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users can update own level" ON public.level;
CREATE POLICY "Users can update own level" ON public.level FOR UPDATE USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users can insert own level" ON public.level;
CREATE POLICY "Users can insert own level" ON public.level FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view own xp" ON public.xp;
CREATE POLICY "Users can view own xp" ON public.xp FOR SELECT USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users can update own xp" ON public.xp;
CREATE POLICY "Users can update own xp" ON public.xp FOR UPDATE USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users can insert own xp" ON public.xp;
CREATE POLICY "Users can insert own xp" ON public.xp FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view own fishes" ON public.fishes;
CREATE POLICY "Users can view own fishes" ON public.fishes FOR SELECT USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users can update own fishes" ON public.fishes;
CREATE POLICY "Users can update own fishes" ON public.fishes FOR ALL USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view own dead fishes" ON public.dead_fishes;
CREATE POLICY "Users can view own dead fishes" ON public.dead_fishes FOR SELECT USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users can update own dead fishes" ON public.dead_fishes;
CREATE POLICY "Users can update own dead fishes" ON public.dead_fishes FOR ALL USING (auth.uid() = profile_id);

-- 7. Trigger to automatically create related records on new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles com email
  INSERT INTO public.profiles (id, email) VALUES (new.id, new.email);
  
  -- Insert into coins (starting with 500)
  INSERT INTO public.coins (profile_id, amount) VALUES (new.id, 500);
  
  -- Insert into level (starting level 1)
  INSERT INTO public.level (profile_id, value) VALUES (new.id, 1);
  
  -- Insert into xp (starting xp 0)
  INSERT INTO public.xp (profile_id, amount) VALUES (new.id, 0);
  
  -- Insert a starting fish 1 (Guppy) sem passar ID
  INSERT INTO public.fishes (
    profile_id, type, species, rarity, color, size, speed, hunger, happiness, age, position_x, position_y, direction, stage, health
  ) VALUES (
    new.id, 'fish', 'Guppy', 'Comum', 'Laranja', 20.0, 2.0, 100.0, 100.0, 0.0, 100.0, 100.0, 1.0, 'adult', 100.0
  );

  -- Insert a starting fish 2 (Clownfish) sem passar ID
  INSERT INTO public.fishes (
    profile_id, type, species, rarity, color, size, speed, hunger, happiness, age, position_x, position_y, direction, stage, health
  ) VALUES (
    new.id, 'fish', 'Clownfish', 'Comum', 'Laranja e Branco', 25.0, 2.5, 100.0, 100.0, 0.0, 150.0, 150.0, -1.0, 'adult', 100.0
  );

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
