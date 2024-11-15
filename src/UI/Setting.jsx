import { useState } from 'react';
import { database } from './firebase';
import { ref, update, get, child } from 'firebase/database';
import { Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import passwordImg from '../assets/login_re.png';

const Setting = () => {
    const userData = localStorage.getItem("userData");
    const currentUser = JSON.parse(userData);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            // Display a loading toast
            const toastId = toast.loading("Updating password...");

            // Find the user in Firebase based on username
            const membersRef = ref(database, 'members');
            const snapshot = await get(child(membersRef, '/'));
            let userKey = null;

            snapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().username === currentUser.username) {
                    userKey = childSnapshot.key;
                }
            });

            if (userKey) {
                const userRef = ref(database, `members/${userKey}`);
                await update(userRef, { password: newPassword });
                
                // Update the toast to success
                toast.update(toastId, {
                    render: "Password updated successfully.",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.update(toastId, {
                    render: "User not found.",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error("Failed to update password.");
            console.error("Error updating password:", error);
        }
    };

    return (
        <div className='flex justify-center items-center'>
            <div className='mt-28'>
                <img src={passwordImg} alt="Password" className="w-96 h-96 mr-24 mt-6" />
            </div>
            <div className='mt-28'>
            <Form className='mt-6 ml-16' onSubmit={handlePasswordChange}>
                <Form.Group controlId="formNewPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        className='w-96'
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formConfirmPassword" className="mt-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        className='w-96'
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                    Update Password
                </Button>
            </Form>
            </div>
            
            <ToastContainer />
        </div>
    );
};

export default Setting;
