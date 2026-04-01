import DashboardLayout from "@/components/DashboardLayout";
import { mockUsers, getStatusBadgeClass } from "@/data/mockData";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ManagerUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const users = mockUsers.filter((u) => {
    const matchSearch = (u.firstName + " " + u.lastName + " " + u.email).toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.userRoles.some((r) => r.role.slug === roleFilter);
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <div className="bento-card">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="cashier">Cashiers</option>
              <option value="manager">Managers</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">User</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-left py-2 font-medium">Role</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img src={u.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium text-foreground">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3 capitalize">{u.userRoles[0]?.role.name}</td>
                    <td className="py-3"><span className={getStatusBadgeClass(u.status)}>{u.status.replace("_", " ")}</span></td>
                    <td className="py-3 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerUsers;
