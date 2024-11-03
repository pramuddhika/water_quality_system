import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const Members = () => {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <h3 className="text-start font-semibold text-xl">
            Member Management
          </h3>
          <p>Be sure to manage your members correctly.</p>
        </div>
        <div>
          <button
            className="bg-sky-600 hover:bg-sky-900 text-white font-bold py-2 px-4 rounded"
            onClick={handleShow}
          >
            Add Member
          </button>
        </div>
      </div>

      <div className="mt-10">
        <table className="table-auto border min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 w-64 border">User Name</th>
              <th className="px-4 py-2 w-48 border">Role</th>
              <th className="px-4 py-2 w-48 border">Status</th>
              <th className="px-4 py-2 w-48 border">Action</th>
            </tr>
          </thead>
        </table>

        <div className="max-h-96 overflow-auto">
          <table className="table-auto border min-w-full">
            <tbody>
              <tr>
                <td className="border px-4 py-2">John Doe</td>
                <td className="border px-4 py-2">Admin</td>
                <td className="border px-4 py-2">Active</td>
                <td className="border px-4 py-2 text-center">
                  <button className="bg-lime-600 hover:bg-lime-800 text-white font-bold py-2 px-4 rounded">
                    Edit
                  </button>
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Jane Doe</td>
                <td className="border px-4 py-2">User</td>
                <td className="border px-4 py-2">Inactive</td>
                <td className="border px-4 py-2 text-center">
                  <button className="bg-lime-600 hover:bg-lime-800 text-white font-bold py-2 px-4 rounded">
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
                />
                          </div>
                          <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="pasword"
                  placeholder="Enter password"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="role" className="form-label">
                  Role
                </label>
                <select className="form-select" id="role">
                  <option>Client</option>
                  <option>Admin</option>
                  <option>Member</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select className="form-select" id="status">
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
            <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Members;
