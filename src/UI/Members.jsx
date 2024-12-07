import { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, push, onValue, update } from "firebase/database";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const Members = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Client");
  const [status, setStatus] = useState("Active");
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const handleClose = () => {
    setShowModal(false);
    setShowEditModal(false);
  };
  const handleShow = () => setShowModal(true);

  // Function to submit new member data to Firebase
  const handleSave = async () => {
    const newMember = {
      username,
      password,
      role,
      status,
    };

    try {
      const membersRef = ref(database, "members");
      await push(membersRef, newMember);
      setShowModal(false);
      clearForm();
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  // Function to open edit modal and populate form with selected member's data
  const handleEdit = (member) => {
    setSelectedMemberId(member.id);
    setUsername(member.username);
    setRole(member.role);
    setStatus(member.status);
    setShowEditModal(true);
  };

  // Function to save edited member data to Firebase
  const handleUpdate = async () => {
    const updatedMember = {
      role,
      status,
    };

    try {
      const memberRef = ref(database, `members/${selectedMemberId}`);
      await update(memberRef, updatedMember);
      setShowEditModal(false);
      clearForm();
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

  // Function to clear the form fields
  const clearForm = () => {
    setUsername("");
    setPassword("");
    setRole("Client");
    setStatus("Active");
  };

  // Fetch members from Firebase
  useEffect(() => {
    const membersRef = ref(database, "members");
    onValue(membersRef, (snapshot) => {
      const membersData = snapshot.val();
      const membersList = membersData
        ? Object.keys(membersData).map((key) => ({
            id: key,
            ...membersData[key],
          }))
        : [];
      setMembers(membersList);
    });
  }, []);

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h3 className="text-start font-semibold text-xl">Member Management</h3>
          <p>Be sure to manage your members correctly.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            className="bg-sky-600 hover:bg-sky-900 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
            onClick={handleShow}
          >
            Add Member
          </button>
        </div>
      </div>
  
      {/* Table Section */}
      <div className="mt-10 overflow-x-auto">
        <table className="table-auto border w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 w-1/4 border">User Name</th>
              <th className="px-4 py-2 w-1/4 border">Role</th>
              <th className="px-4 py-2 w-1/4 border">Status</th>
              <th className="px-4 py-2 w-1/4 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id}>
                  <td className="border px-4 py-2">{member.username}</td>
                  <td className="border px-4 py-2">{member.role}</td>
                  <td className="border px-4 py-2">{member.status}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      className="bg-lime-600 hover:bg-lime-800 text-white font-bold py-1 px-3 rounded"
                      onClick={() => handleEdit(member)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No data to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  
      {/* Add Member Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                User Name
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter user name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                className="form-select"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Client</option>
                <option>Admin</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                className="form-select"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
  
      {/* Edit Member Modal */}
      <Modal show={showEditModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                User Name
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                className="form-select"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Client</option>
                <option>Admin</option>
                <option>Member</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                className="form-select"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
  
};

export default Members;
