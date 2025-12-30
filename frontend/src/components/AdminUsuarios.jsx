import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usersApi } from "@/api/tasks.api";
import { Edit, Trash2, UserPlus, Eye, EyeOff } from "lucide-react";

const roles = [
	{ value: "administrador", label: "Administrador" },
	{ value: "planificador", label: "Planificador" },
	{ value: "user", label: "Usuario" },
];

export default function AdminUsuarios() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showDialog, setShowDialog] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [form, setForm] = useState({
		username: "",
		email: "",
		role: "user",
		password: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [search, setSearch] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const fetchUsers = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await usersApi.getAll();
			setUsers(res.data);
		} catch (err) {
			setError("No se pudieron cargar los usuarios");
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleAdd = () => {
		setEditingUser(null);
		setForm({ username: "", email: "", role: "user", password: "" });
		setShowDialog(true);
		setError("");
		setSuccess("");
		setShowPassword(false);
	};

	const handleEdit = (user) => {
		setEditingUser(user);
		setForm({
			username: user.username,
			email: user.email,
			role: user.groups && user.groups.length > 0 ? user.groups[0] : "user",
			password: "",
		});
		setShowDialog(true);
		setError("");
		setSuccess("");
		setShowPassword(false);
	};

	const handleDelete = async (user) => {
		if (!window.confirm(`¿Eliminar usuario ${user.username}?`)) return;
		try {
			await usersApi.delete(user.id);
			setSuccess("Usuario eliminado");
			fetchUsers();
		} catch {
			setError("No se pudo eliminar el usuario");
		}
	};

	const handleSubmit = async (e, continueAdding = false) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		try {
			const body = { ...form };
			if (!editingUser && !form.password) {
				setError("La contraseña es obligatoria");
				return;
			}
			if (editingUser && !form.password) {
				delete body.password;
			}
			if (editingUser) {
				await usersApi.update(editingUser.id, body);
				setSuccess("Usuario actualizado");
				setShowDialog(false);
				fetchUsers();
			} else {
				await usersApi.create(body);
				if (continueAdding) {
					setSuccess("Usuario creado exitosamente");
					setForm({ username: "", email: "", role: "user", password: "" });
					setShowPassword(false);
					fetchUsers();
				} else {
					setSuccess("Usuario creado");
					setShowDialog(false);
					fetchUsers();
				}
			}
		} catch {
			setError("No se pudo guardar el usuario");
		}
	};

	const filteredUsers = users.filter((user) => {
		const searchLower = search.toLowerCase();
		return (
			user.username.toLowerCase().includes(searchLower) ||
			user.email.toLowerCase().includes(searchLower) ||
			(user.groups && user.groups.length > 0 && user.groups[0].toLowerCase().includes(searchLower))
		);
	});

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#006599] to-[#12a6b9] p-8">
			<div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl p-8 border-2 border-white">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-[#006599]">
						Gestión de Usuarios
					</h2>
					<Button
						onClick={handleAdd}
						className="bg-[#12a6b9] text-white font-semibold hover:bg-[#0e8ca0]"
					>
						<UserPlus className="mr-2 h-5 w-5" /> Nuevo Usuario
					</Button>
				</div>
				{/* Buscador de usuarios */}
				<div className="mb-4 flex justify-end">
					<Input
						type="text"
						placeholder="Buscar usuario, email o rol..."
						value={search}
						onChange={e => setSearch(e.target.value)}
						className="w-full max-w-xs bg-gray-200 border-2 border-gray-300 rounded-xl px-4 py-2 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow transition-all duration-200 text-gray-900"
					/>
				</div>
				{error && (
					<div className="mb-4 text-red-700 bg-red-100 rounded p-2">
						{error}
					</div>
				)}
				{success && (
					<div className="mb-4 text-green-700 bg-green-100 rounded p-2">
						{success}
					</div>
				)}
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border rounded-xl">
						<thead>
							<tr className="bg-[#006599] text-white">
								<th className="py-2 px-4 text-center">Usuario</th>
								<th className="py-2 px-4 text-center">Email</th>
								<th className="py-2 px-4 text-center">Grupo</th>
								<th className="py-2 px-4 text-center">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan="4" className="text-center py-6">
										Cargando...
									</td>
								</tr>
							) : filteredUsers.length === 0 ? (
								<tr>
									<td colSpan="4" className="text-center py-6">
										No hay usuarios
									</td>
								</tr>
							) : (
								filteredUsers.map((user) => (
									<tr
										key={user.id}
										className="border-b hover:bg-gray-100"
									>
										<td className="py-2 px-4 text-center">{user.username}</td>
										<td className="py-2 px-4 text-center">{user.email}</td>
										<td className="py-2 px-4 text-center capitalize">{user.groups && user.groups.length > 0 ? user.groups[0] : "user"}</td>
										<td className="py-2 px-4 flex justify-center gap-2">
											<Button
												size="sm"
												variant="outline"
												className="bg-[#12a6b9] text-white hover:bg-[#0e8ca0]"
												onClick={() => handleEdit(user)}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="bg-red-600 text-white hover:bg-red-700"
												onClick={() => handleDelete(user)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
			{/* Modal para crear/editar usuario */}
			{showDialog && (
				<Dialog open={showDialog} onOpenChange={setShowDialog}>
					<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
						<form
							onSubmit={handleSubmit}
							className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md border-2 border-[#12a6b9]"
						>
							<h3 className="text-xl font-bold text-[#006599] mb-4">
								{editingUser ? "Editar Usuario" : "Nuevo Usuario"}
							</h3>
							<div className="mb-4">
								<label className="block text-[#006599] font-semibold mb-2">
									Usuario
								</label>
								<Input
									name="username"
									value={form.username}
									onChange={handleChange}
									required
									autoComplete="username"
									className="w-full bg-gray-200 border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow transition-all duration-200 text-gray-900"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-[#006599] font-semibold mb-2">
									Email
								</label>
								<Input
									name="email"
									type="email"
									value={form.email}
									onChange={handleChange}
									required
									autoComplete="email"
									className="w-full bg-gray-200 border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow transition-all duration-200 text-gray-900"
								/>
							</div>
							<div className="mb-4">
								<label className="block text-[#006599] font-semibold mb-2">
									Rol
								</label>
								<select
									name="role"
									value={form.role}
									onChange={handleChange}
									className="w-full bg-gray-200 border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow transition-all duration-200 text-gray-900"
								>
									{roles.map((r) => (
										<option key={r.value} value={r.value}>
											{r.label}
										</option>
									))}
								</select>
							</div>
							<div className="mb-6">
								<label className="block text-[#006599] font-semibold mb-2">
									Contraseña{" "}
									{editingUser && (
										<span className="text-gray-500">
											(dejar vacío para no cambiar)
										</span>
									)}
								</label>
								<div className="relative">
									<Input
										name="password"
										type={showPassword ? "text" : "password"}
										value={form.password}
										onChange={handleChange}
										className="w-full bg-gray-200 border-2 border-gray-300 rounded-xl px-4 py-3 pr-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow transition-all duration-200 text-gray-900"
										required={!editingUser}
										autoComplete={editingUser ? "new-password" : "new-password"}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#006599] transition-colors"
									>
										{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
									</button>
								</div>
							</div>
							<div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3">
								<Button
									type="button"
									variant="outline"
									className="w-full sm:w-auto bg-gray-200 text-gray-700 order-2 sm:order-1"
									onClick={() => setShowDialog(false)}
								>
									Cancelar
								</Button>
								<div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
									{!editingUser && (
										<Button
											type="button"
											onClick={(e) => handleSubmit(e, true)}
											className="w-full sm:w-auto bg-[#12a6b9] text-white font-semibold hover:bg-[#0e8ca0] whitespace-nowrap"
										>
											Crear y Agregar Otro
										</Button>
									)}
									<Button
										type="submit"
										className="w-full sm:w-auto bg-[#006599] text-white font-semibold hover:bg-[#005080]"
									>
										{editingUser ? "Guardar Cambios" : "Crear Usuario"}
									</Button>
								</div>
							</div>
							{error && (
								<div className="mt-4 text-red-700 bg-red-100 rounded p-2">
									{error}
								</div>
							)}
						</form>
					</div>
				</Dialog>
			)}
		</div>
	);
}

