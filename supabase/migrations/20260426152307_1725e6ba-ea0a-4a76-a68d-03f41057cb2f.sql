
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT NOT NULL,
  image_key TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  color TEXT NOT NULL DEFAULT '#FF5A5F'
);

CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('food','souvenirs','spots','activities')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  price_level INT NOT NULL DEFAULT 2,
  image_key TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL
);

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  destination_slug TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  budget TEXT NOT NULL DEFAULT 'medium',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "public read zones" ON public.zones FOR SELECT USING (true);
CREATE POLICY "public read places" ON public.places FOR SELECT USING (true);

CREATE POLICY "anyone read prefs by session" ON public.user_preferences FOR SELECT USING (true);
CREATE POLICY "anyone insert prefs" ON public.user_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone update prefs" ON public.user_preferences FOR UPDATE USING (true);
