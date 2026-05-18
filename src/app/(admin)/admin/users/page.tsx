import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { updateUserRoleAction, updateUserStatusAction } from './actions';
import { Ban, Trash2, CheckCircle } from 'lucide-react';
import { ExportUsersModal } from './export-modal';
import { AdminPageHeader, AdminTableShell } from '@/components/admin/admin-page';
import { ConfirmSubmitButton } from '@/components/admin/confirm-submit-button';

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Quản lý quyền hạn, trạng thái và thông tin khách hàng."
        actions={<ExportUsersModal />}
      />

      <AdminTableShell>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="font-medium text-left p-4">Khách Hàng</th>
                <th className="font-medium text-left p-4">Email</th>
                <th className="font-medium text-left p-4">Số Điện Thoại</th>
                <th className="font-medium text-center p-4">Ngày Tham Gia</th>
                <th className="font-medium text-center p-4">Quyền (Role)</th>
                <th className="font-medium text-center p-4">Trạng Thái</th>
                <th className="font-medium text-center p-4">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users && users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{u.full_name || 'Khách chưa đặt tên'}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {u.phone_number || 'Chưa cập nhật'}
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="uppercase">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={u.status === 'banned' ? 'destructive' : 'outline'} className="uppercase">
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <form action={updateUserRoleAction.bind(null, u.user_id, u.role === 'admin' ? 'customer' : 'admin')}>
                          <button type="submit" className={`text-xs underline ${u.role === 'admin' ? 'text-destructive' : 'text-primary'}`}>
                            {u.role === 'admin' ? 'Hủy quyền Admin' : 'Cấp quyền Admin'}
                          </button>
                        </form>
                        <div className="flex items-center gap-2 mt-2">
                          <form action={updateUserStatusAction.bind(null, u.user_id, u.status === 'banned' ? 'active' : 'banned')}>
                            <button type="submit" title={u.status === 'banned' ? 'Mở khóa' : 'Khóa tài khoản'} className={`p-1.5 rounded-md hover:bg-muted ${u.status === 'banned' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {u.status === 'banned' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </button>
                          </form>
                          <form action={updateUserStatusAction.bind(null, u.user_id, 'deleted')}>
                            <ConfirmSubmitButton
                              message={`Bạn có chắc muốn xóa tài khoản "${u.email}"?`}
                              title="Xóa tài khoản"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:bg-muted"
                            >
                              <Trash2 className="h-4 w-4" />
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </AdminTableShell>
    </>
  );
}
