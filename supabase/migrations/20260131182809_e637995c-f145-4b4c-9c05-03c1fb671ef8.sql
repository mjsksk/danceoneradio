-- Create newsletter_templates table for custom templates
CREATE TABLE public.newsletter_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 100000),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can view templates
CREATE POLICY "Admins can view templates"
ON public.newsletter_templates
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can create templates
CREATE POLICY "Admins can create templates"
ON public.newsletter_templates
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update templates
CREATE POLICY "Admins can update templates"
ON public.newsletter_templates
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete templates
CREATE POLICY "Admins can delete templates"
ON public.newsletter_templates
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_newsletter_templates_updated_at
BEFORE UPDATE ON public.newsletter_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_newsletter_templates_created_at ON public.newsletter_templates(created_at DESC);