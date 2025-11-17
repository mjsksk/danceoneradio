import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function validateApiKey(
  supabase: SupabaseClient,
  apiKey: string | null
): Promise<{ valid: boolean; serviceName?: string }> {
  if (!apiKey) {
    return { valid: false };
  }

  // Hash the provided key for comparison
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Check if this key exists and is active
  const { data: apiKeyRecord, error } = await supabase
    .from('api_keys')
    .select('service_name, is_active')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !apiKeyRecord) {
    console.warn('Invalid API key attempt');
    return { valid: false };
  }

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash);

  return { valid: true, serviceName: apiKeyRecord.service_name };
}
