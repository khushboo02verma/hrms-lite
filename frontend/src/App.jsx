import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [employees, setEmployees] = useState([]);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [status, setStatus] = useState('Present');

  const getEmps = () => {
    axios.get("http://localhost:8000/employees")
      .then(res => setEmployees(res.data))
      .catch(err => console.log("Server error!"));
  };

  useEffect(() => { getEmps(); }, []);

  const addEmp = (e) => {
    e.preventDefault();
    axios.post("http://localhost:8000/employees", { id, name, email, department: dept })
      .then(() => {
        alert("Employee Added!");
        setId(''); setName(''); setEmail(''); setDept('');
        getEmps();
      })
      .catch(err => alert("Error: " + err.response.data.detail));
  };

  const deleteEmp = (empId) => {
    if(window.confirm("Delete this employee?")) {
      axios.delete(`http://localhost:8000/employees/${empId}`)
        .then(() => getEmps());
    }
  };

  const markAttendance = (e) => {
    e.preventDefault();
    axios.post("http://localhost:8000/attendance", { 
      emp_id: selectedEmp, 
      date: new Date().toISOString().split('T')[0], 
      status: status 
    })
    .then(() => alert("Attendance Marked!"))
    .catch(() => alert("Error marking attendance"));
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: 'auto', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>HRMS Lite - Admin Panel</h1>
      
      {/* Employee Management Section */}
      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>1. Add Employee</h3>
        <form onSubmit={addEmp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input placeholder="ID (Unique)" value={id} onChange={e => setId(e.target.value)} required />
          <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          <input placeholder="Email (Valid format)" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input placeholder="Department" value={dept} onChange={e => setDept(e.target.value)} required />
          <button type="submit" style={{ gridColumn: 'span 2', background: '#28a745', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer' }}>Add Employee</button>
        </form>
      </div>

      {/* Attendance Section */}
      <div style={{ background: '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>2. Mark Attendance</h3>
        <form onSubmit={markAttendance} style={{ display: 'flex', gap: '10px' }}>
          <select onChange={(e) => setSelectedEmp(e.target.value)} required>
            <option value="">Select Employee</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
          </select>
          <select onChange={(e) => setStatus(e.target.value)}>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          <button type="submit" style={{ background: '#007bff', color: '#fff', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>Mark</button>
        </form>
      </div>

      {/* Employee List Table */}
      <h3>3. Employee Records</h3>
      <table border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead style={{ background: '#333', color: '#fff' }}>
          <tr><th>ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Action</th></tr>
        </thead>
        <tbody>
          {employees.length === 0 ? <tr><td colSpan="5">No Employees Found</td></tr> : 
            employees.map(e => (
              <tr key={e.id}>
                <td>{e.id}</td><td>{e.name}</td><td>{e.email}</td><td>{e.department}</td>
                <td><button onClick={() => deleteEmp(e.id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button></td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default App;