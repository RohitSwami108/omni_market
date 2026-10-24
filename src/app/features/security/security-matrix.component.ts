import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SystemProfile {
  id: string;
  name: string;
  badge: string;
  activeUsers: number;
  description: string;
}

export interface PermissionRow {
  key: string;
  name: string;
  description: string;
  scope: 'Global System' | 'Tenant Scope' | 'Assigned Only';
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canAdmin: boolean;
}

export interface PermissionGroup {
  id: string;
  title: string;
  icon: string;
  expanded: boolean;
  permissions: PermissionRow[];
}

@Component({
  selector: 'app-security-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-matrix.component.html',
  styleUrl: './security-matrix.component.scss'
})
export class SecurityMatrixComponent {
  // Active Profile Tabs
  readonly profiles = signal<SystemProfile[]>([
    {
      id: 'superadmin',
      name: 'SuperAdmin',
      badge: 'Full Root',
      activeUsers: 8,
      description: 'Unrestricted cluster-wide infrastructure, identity, and financial operations'
    },
    {
      id: 'vendor',
      name: 'Vendor Partner',
      badge: 'Tenant Admin',
      activeUsers: 1420,
      description: 'Storefront inventory governance, fulfillment queues, and payout metrics'
    },
    {
      id: 'auditor',
      name: 'Compliance Auditor',
      badge: 'Read Only',
      activeUsers: 14,
      description: 'Immutable read access to cryptographic logs, auth ledgers, and SOC2 trails'
    },
    {
      id: 'customer',
      name: 'Store Customer',
      badge: 'Standard',
      activeUsers: 89400,
      description: 'Standard consumer profile with self-service order and profile management'
    }
  ]);

  readonly activeProfileId = signal<string>('vendor');
  readonly hasUnsavedChanges = signal<boolean>(true);
  readonly unsavedCount = signal<number>(3);
  readonly searchQuery = signal<string>('');

  // Permission Matrix Groups
  readonly groups = signal<PermissionGroup[]>([
    {
      id: 'products',
      title: 'Products & Inventory Catalog',
      icon: 'cube',
      expanded: true,
      permissions: [
        {
          key: 'catalog:products:view',
          name: 'products:read',
          description: 'Query live and archived SKU specifications across multi-warehouse nodes',
          scope: 'Tenant Scope',
          canRead: true,
          canWrite: false,
          canDelete: false,
          canAdmin: false
        },
        {
          key: 'catalog:products:mutate',
          name: 'products:create',
          description: 'Provision new inventory assets and publish vendor product variations',
          scope: 'Tenant Scope',
          canRead: true,
          canWrite: true,
          canDelete: false,
          canAdmin: false
        },
        {
          key: 'catalog:products:remove',
          name: 'products:delete',
          description: 'Trigger hard archival or SKU deletion across storefront and API endpoints',
          scope: 'Tenant Scope',
          canRead: true,
          canWrite: true,
          canDelete: true,
          canAdmin: false
        }
      ]
    },
    {
      id: 'users',
      title: 'Identity & User Directory',
      icon: 'users',
      expanded: true,
      permissions: [
        {
          key: 'iam:users:list',
          name: 'users:read',
          description: 'Inspect vendor team rosters, role assignments, and 2FA status',
          scope: 'Tenant Scope',
          canRead: true,
          canWrite: false,
          canDelete: false,
          canAdmin: false
        },
        {
          key: 'iam:users:invite',
          name: 'users:invite',
          description: 'Dispatch organization workspace invitations and grant scoped access tokens',
          scope: 'Tenant Scope',
          canRead: true,
          canWrite: true,
          canDelete: false,
          canAdmin: false
        },
        {
          key: 'iam:users:terminate',
          name: 'users:suspend',
          description: 'Instantly revoke active OAuth refresh tokens and freeze team members',
          scope: 'Tenant Scope',
          canRead: true,
          canWrite: false,
          canDelete: true,
          canAdmin: false
        }
      ]
    },
    {
      id: 'security',
      title: 'Security, Encryption & Cluster Ops',
      icon: 'shield',
      expanded: false,
      permissions: [
        {
          key: 'sec:keys:rotate',
          name: 'api_keys:generate',
          description: 'Issue and revoke automated service-account HMAC signature credentials',
          scope: 'Global System',
          canRead: true,
          canWrite: true,
          canDelete: false,
          canAdmin: true
        },
        {
          key: 'sec:audit:export',
          name: 'audit_logs:export',
          description: 'Stream unredacted cryptographic SIEM activity trails to S3 or Splunk',
          scope: 'Global System',
          canRead: true,
          canWrite: false,
          canDelete: false,
          canAdmin: false
        }
      ]
    }
  ]);

  readonly activeProfile = computed(() => {
    return this.profiles().find(p => p.id === this.activeProfileId()) || this.profiles()[0];
  });

  selectProfile(id: string) {
    this.activeProfileId.set(id);
  }

  toggleGroupExpand(groupId: string) {
    this.groups.update(list => list.map(g => {
      if (g.id === groupId) {
        return { ...g, expanded: !g.expanded };
      }
      return g;
    }));
  }

  togglePermission(groupId: string, permKey: string, field: 'canRead' | 'canWrite' | 'canDelete' | 'canAdmin') {
    this.groups.update(list => list.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          permissions: g.permissions.map(p => {
            if (p.key === permKey) {
              return { ...p, [field]: !p[field] };
            }
            return p;
          })
        };
      }
      return g;
    }));
    this.hasUnsavedChanges.set(true);
    this.unsavedCount.update(c => c + 1);
  }

  toggleAllInGroup(group: PermissionGroup, enable: boolean) {
    this.groups.update(list => list.map(g => {
      if (g.id === group.id) {
        return {
          ...g,
          permissions: g.permissions.map(p => ({
            ...p,
            canRead: enable,
            canWrite: enable,
            canDelete: enable,
            canAdmin: enable
          }))
        };
      }
      return g;
    }));
    this.hasUnsavedChanges.set(true);
  }

  resetConfiguration() {
    this.hasUnsavedChanges.set(false);
    this.unsavedCount.set(0);
  }

  saveConfiguration() {
    this.hasUnsavedChanges.set(false);
    this.unsavedCount.set(0);
  }
}
