import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode'; // <--- Import this

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser(email, password);
            
            // 1. Save Token
            login(data.token); 
            toast.success("Login Successful!");

            // 2. Decode Token to get the REAL Role
            const decoded = jwtDecode(data.token);
            console.log("Decoded Token:", decoded); // Debugging: Check console to see what prints here

            // 3. Extract Role (Handle "ROLE_STUDENT" vs "STUDENT" vs Arrays)
            let role = decoded.roles || decoded.role || decoded.authorities;
            
            // If role is an array (Spring sometimes sends ["ROLE_STUDENT"]), take the first string
            if (Array.isArray(role)) {
                role = role[0];
            }
            
            // If it comes as an object { authority: "ROLE_STUDENT" }
            if (typeof role === 'object' && role.authority) {
                role = role.authority;
            }

            console.log("User Role Found:", role); // Debugging

            // 4. Redirect based on Role
            if (role === 'STUDENT' || role === 'ROLE_STUDENT') {
                navigate('/student/dashboard');
            } 
            else if (role === 'RECRUITER' || role === 'ROLE_RECRUITER') {
                navigate('/recruiter/dashboard');
            } 
            else if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
                navigate('/admin/dashboard');
            } 
            else {
                console.error("Unknown Role:", role);
                navigate('/'); 
            }
            
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Invalid Credentials");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-1 text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;