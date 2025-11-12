import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
    is_active: boolean;
    approval_status: string;
    role_data: any;
}

interface Stats {
    total: number;
    by_type: {
        students: number;
        teachers: number;
        admins: number;
    };
    status: {
        active: number;
        inactive: number;
    };
}

const API_BASE = 'http://127.0.0.1:8000/api';

const AdminUserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize] = useState(20);
    const [search, setSearch] = useState('');
    const [userType, setUserType] = useState('');
    const [status, setStatus] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: string;
        userId: number;
        reason?: string;
    } | null>(null);
    const [actionMessage, setActionMessage] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, [page, search, userType, status]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/users/manage/stats/`, {
                headers: { Authorization: `Token ${token}` },
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE}/users/manage/?page=${page}&page_size=${pageSize}`;
            if (search) url += `&search=${search}`;
            if (userType) url += `&user_type=${userType}`;
            if (status) url += `&status=${status}`;

            const response = await fetch(url, {
                headers: { Authorization: `Token ${token}` },
            });
            const data = await response.json();

            setUsers(data.users);
            setTotal(data.total);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type: string, userId: number, reason = '') => {
        try {
            const endpoint = `${API_BASE}/users/manage/${userId}/${type}/`;
            const body = reason ? { reason } : {};

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            setActionMessage(data.message || `${type} successful`);
            setUsers(users.map(u => (u.id === userId ? data.user : u)));
            setShowConfirm(false);
            setConfirmAction(null);

            setTimeout(() => setActionMessage(''), 3000);
            fetchStats();
        } catch (error: any) {
            setActionMessage(error.message || 'Action failed');
            setTimeout(() => setActionMessage(''), 3000);
        }
    };

    const handleBulkAction = async (actionType: string, reason = '') => {
        if (selectedUsers.size === 0) {
            setActionMessage('No users selected');
            setTimeout(() => setActionMessage(''), 3000);
            return;
        }

        try {
            const endpoint = `${API_BASE}/users/manage/bulk_action/`;
            const body = {
                user_ids: Array.from(selectedUsers),
                action: actionType,
                ...(reason && { reason }),
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            setActionMessage(data.message);
            setSelectedUsers(new Set());
            fetchUsers();
            fetchStats();
        } catch (error: any) {
            setActionMessage(error.message || 'Action failed');
        }
        setTimeout(() => setActionMessage(''), 3000);
    };

    const toggleUserSelection = (userId: number) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const getRoleBadgeColor = (type: string) => {
        switch (type) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'teacher':
                return 'bg-blue-100 text-blue-800';
            case 'student':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (active: boolean) => {
        return active ? 'text-green-600' : 'text-red-600';
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                    <p className="text-gray-600">Manage all users, teachers, and students</p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-400"
                            whileHover={{ y: -2 }}
                        >
                            <p className="text-gray-600 text-sm">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </motion.div>
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-400"
                            whileHover={{ y: -2 }}
                        >
                            <p className="text-gray-600 text-sm">Students</p>
                            <p className="text-3xl font-bold text-green-600">{stats.by_type.students}</p>
                        </motion.div>
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-400"
                            whileHover={{ y: -2 }}
                        >
                            <p className="text-gray-600 text-sm">Teachers</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.by_type.teachers}</p>
                        </motion.div>
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-400"
                            whileHover={{ y: -2 }}
                        >
                            <p className="text-gray-600 text-sm">Admins</p>
                            <p className="text-3xl font-bold text-red-600">{stats.by_type.admins}</p>
                        </motion.div>
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-400"
                            whileHover={{ y: -2 }}
                        >
                            <p className="text-gray-600 text-sm">Active</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.status.active}</p>
                        </motion.div>
                    </div>
                )}

                {/* Action Message */}
                <AnimatePresence>
                    {actionMessage && (
                        <motion.div
                            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${actionMessage.includes('error') || actionMessage.includes('failed')
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                                }`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {actionMessage.includes('error') || actionMessage.includes('failed') ? (
                                <span>⚠️</span>
                            ) : (
                                <span>✓</span>
                            )}
                            {actionMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filters and Search */}
                <motion.div
                    className="bg-white p-6 rounded-lg shadow-sm mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or username..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={userType}
                            onChange={e => {
                                setUserType(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Types</option>
                            <option value="student">Students</option>
                            <option value="teacher">Teachers</option>
                            <option value="admin">Admins</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={status}
                            onChange={e => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedUsers.size > 0 && (
                        <motion.div
                            className="mt-4 p-4 bg-blue-50 rounded-lg flex flex-wrap gap-2 items-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <span className="font-semibold text-blue-900">{selectedUsers.size} selected</span>
                            <button
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                                onClick={() => handleBulkAction('disable')}
                            >
                                Disable All
                            </button>
                            <button
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                                onClick={() => handleBulkAction('enable')}
                            >
                                Enable All
                            </button>
                            <button
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                                onClick={() => {
                                    if (confirm('Are you sure? This cannot be undone.')) {
                                        handleBulkAction('delete');
                                    }
                                }}
                            >
                                Delete All
                            </button>
                            <button
                                className="ml-auto px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm"
                                onClick={() => setSelectedUsers(new Set())}
                            >
                                Clear
                            </button>
                        </motion.div>
                    )}
                </motion.div>

                {/* Users Table */}
                <motion.div
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No users found</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.size === users.length}
                                                    onChange={() => {
                                                        if (selectedUsers.size === users.length) {
                                                            setSelectedUsers(new Set());
                                                        } else {
                                                            setSelectedUsers(new Set(users.map(u => u.id)));
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                                Approval
                                            </th>
                                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, idx) => (
                                            <motion.tr
                                                key={user.id}
                                                className="border-b border-gray-200 hover:bg-gray-50"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.has(user.id)}
                                                        onChange={() => toggleUserSelection(user.id)}
                                                        className="rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {user.first_name} {user.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">@{user.username}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.user_type)}`}>
                                                        {user.user_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1 text-sm font-semibold ${getStatusColor(user.is_active)}`}>
                                                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-600' : 'bg-red-600'}`} />
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
                                                        {user.approval_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        {user.is_active ? (
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                onClick={() => {
                                                                    setConfirmAction({
                                                                        type: 'disable',
                                                                        userId: user.id,
                                                                    });
                                                                    setShowConfirm(true);
                                                                }}
                                                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                                                title="Disable"
                                                            >
                                                                🔌
                                                            </motion.button>
                                                        ) : (
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                onClick={() =>
                                                                    handleAction('enable', user.id)
                                                                }
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                                title="Enable"
                                                            >
                                                                ⚡
                                                            </motion.button>
                                                        )}

                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            onClick={() => {
                                                                setConfirmAction({
                                                                    type: 'block',
                                                                    userId: user.id,
                                                                });
                                                                setShowConfirm(true);
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                            title="Block"
                                                        >
                                                            🔒
                                                        </motion.button>

                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            onClick={() =>
                                                                handleAction('delete_user', user.id)
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {(page - 1) * pageSize + 1} to{' '}
                                    {Math.min(page * pageSize, total)} of {total} users
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                    >
                                        ←
                                    </button>
                                    <span className="px-4 py-2 text-sm font-semibold">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                    >
                                        →
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && confirmAction && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">
                                Confirm {confirmAction.type}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to {confirmAction.type} this user? This action may be
                                reversible.
                            </p>

                            {(confirmAction.type === 'block' || confirmAction.type === 'delete_user') && (
                                <input
                                    type="text"
                                    placeholder="Reason (optional)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={e => {
                                        setConfirmAction({
                                            ...confirmAction,
                                            reason: e.target.value,
                                        });
                                    }}
                                />
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirm(false);
                                        setConfirmAction(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmAction) {
                                            handleAction(confirmAction.type, confirmAction.userId, confirmAction.reason);
                                        }
                                    }}
                                    className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold ${confirmAction.type === 'delete_user'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : confirmAction.type === 'block'
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-yellow-600 hover:bg-yellow-700'
                                        }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUserManagement;
