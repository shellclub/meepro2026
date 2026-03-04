"use client";

import { useState, useEffect } from "react";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("admin");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setUsername(user.username);
      setPassword(""); // Don't show password for edit
      setName(user.name);
      setRole(user.role);
      setIsActive(user.isActive === 1 || user.isActive === true);
    } else {
      setEditingUser(null);
      setUsername("");
      setPassword("");
      setName("");
      setRole("admin");
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, any> = { username, name, role, isActive };
      if (password) {
        payload.password = password;
      }

      let res;
      if (editingUser) {
        res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        fetchUsers();
        handleCloseModal();
      } else {
        const data = await res.json();
        alert("ข้อผิดพลาด: " + (data.error || "เกิดข้อผิดพลาดบางอย่าง"));
      }
    } catch (e) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert("ข้อผิดพลาด: " + (data.error || "ลบไม่ได้"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>จัดการผู้ใช้งานระบบ</h2>
        <button
          onClick={() => handleOpenModal()}
          style={{ background: "#F28C28", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          + เพิ่มผู้ใช้
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        {loading ? (
          <div>กำลังโหลดข้อมูล...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>ID</th>
                <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>ชื่อผู้ใช้ (Username)</th>
                <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>ชื่อที่แสดง</th>
                <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>บทบาท</th>
                <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>สถานะ</th>
                <th style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>{user.id}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>{user.username}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>{user.name}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ background: user.role === 'superadmin' ? "#fef3c7" : "#e0f2fe", color: user.role === 'superadmin' ? "#92400e" : "#075985", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: user.isActive ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                      {user.isActive ? "🟢 ใช้งาน" : "🔴 ระงับ"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleOpenModal(user)}
                        style={{ padding: "6px 12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{ padding: "6px 12px", background: "#fee2e2", border: "1px solid #fca5a5", color: "#ef4444", borderRadius: "4px", cursor: "pointer" }}
                        disabled={user.username === 'admin'}
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal / Popup for Create & Edit */}
      {modalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", width: "400px", borderRadius: "12px", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3>{editingUser ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>

              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>ชื่อผู้ใช้ (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={editingUser?.username === 'admin'}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>รหัสผ่าน {editingUser && "(เว้นว่างถ้าไม่ต้องการเปลี่ยน)"}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingUser}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>ชื่อที่แสดง (Name)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>บทบาท (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  <option value="admin">Admin ทั่วไป</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  id="isActive"
                  disabled={editingUser?.username === 'admin'} // Admin หลักเปลี่ยนสถานะไม่ได้
                />
                <label htmlFor="isActive">สถานะบัญชี เปิดใช้งาน</label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: "10px 16px", background: "#f1f5f9", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  ยกเลิก
                </button>
                <button type="submit" style={{ padding: "10px 16px", background: "#F28C28", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  {editingUser ? "บันทึกข้อมูล" : "สร้างผู้ใช้งาน"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
