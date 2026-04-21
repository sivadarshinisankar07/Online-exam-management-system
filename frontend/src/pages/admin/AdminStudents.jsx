import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/students').then(r => setStudents(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    await api.patch(`/admin/students/${id}/toggle-status`);
    load();
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Students</h1>
          <p>Manage registered students — {students.length} total</p>
        </div>
        <input className="form-control" style={{ maxWidth:280 }}
          placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="user-avatar" style={{ width:32, height:32, fontSize:12 }}>
                        {s.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      {s.name}
                    </div>
                  </td>
                  <td>{s.email}</td>
                  <td>{s.phone || '—'}</td>
                  <td>
                    <span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}>
                      {s.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <button className={`btn btn-sm ${s.active ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggle(s.id)}>
                      {s.active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>
                  No students found.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
