import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'moderator' | 'user';

interface UserRoleState {
  roles: AppRole[];
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
}

export function useUserRole(): UserRoleState {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      // Wait for auth to finish loading first
      if (authLoading) {
        return; // Don't set loading to false yet
      }

      if (!user) {
        setRoles([]);
        setRoleLoading(false);
        return;
      }

      try {
        console.log('Fetching roles for user:', user.id);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
        } else {
          const fetchedRoles = (data || []).map(r => r.role as AppRole);
          console.log('Fetched roles:', fetchedRoles);
          setRoles(fetchedRoles);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setRoleLoading(false);
      }
    }

    fetchRoles();
  }, [user, authLoading]);

  // Only report as "done loading" when both auth is done AND roles are fetched
  const loading = authLoading || roleLoading;

  return {
    roles,
    isAdmin: roles.includes('admin'),
    isModerator: roles.includes('moderator'),
    loading
  };
}
