import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ShoppingCart,
	FileText,
	Receipt,
	Clock,
	CheckCircle2,
	AlertCircle,
	Plus,
	Package,
	Users,
	LogInIcon,
} from 'lucide-react';
import { getList } from '../../API/purchaseOrderApi.js';
import { formatGenericDate } from '../../utils/FormatGenericDate.js';
// import { useAuthStore } from '../../store/authStore'; // fix this path to your store
import { normalize, buildStats, formatMoney } from '../../utils/dashboardUtils.js';
import useProducts from '../../hooks/useProducts.js';
import { useAppStore } from '../../store/useAppStore.js';

// One config drives the fetch, the banner buttons, the KPI cards and the badges
const DOC_TYPES = {
	PO: {
		label: 'Purchase Order',
		title: 'Purchase Orders',
		api: '/api/v1/purchase-order/all-orders',
		createPath: '/po',
		listPath: '/dashboard/po',
		icon: ShoppingCart,
		iconColor: 'text-blue-600',
		hover: 'hover:border-blue-400',
		badge: 'bg-blue-100 text-blue-800',
	},
	SO: {
		label: 'Sale Order',
		title: 'Sale Orders',
		api: '/api/v1/sale-orders',
		createPath: '/so',
		listPath: '/dashboard/so',
		icon: FileText,
		iconColor: 'text-emerald-600',
		hover: 'hover:border-emerald-400',
		badge: 'bg-emerald-100 text-emerald-800',
	},
	PI: {
		label: 'Proforma Invoice',
		title: 'Proforma Invoices',
		api: '/api/v1/proforma-invoices',
		createPath: '/pi',
		listPath: '/pi', // change to '/dashboard/pi' when that page exists
		icon: Receipt,
		iconColor: 'text-indigo-600',
		hover: 'hover:border-indigo-400',
		badge: 'bg-indigo-100 text-indigo-800',
	},
};

const STATUS_STYLE = {
	draft: 'bg-amber-100 text-amber-800',
	pending: 'bg-blue-100 text-blue-800',
	open: 'bg-blue-100 text-blue-800',
	approved: 'bg-emerald-100 text-emerald-800',
	converted: 'bg-indigo-100 text-indigo-800',
	cancelled: 'bg-rose-100 text-rose-800',
};

const EMPTY_DOCS = { PO: [], SO: [], PI: [] };

// ---------- small components ----------
const StatCard = ({ meta, data, money, onClick }) => {
	const Icon = meta.icon;
	return (
		<div
			onClick={onClick}
			className={`bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer transition-all ${meta.hover}`}
		>
			<div className="flex justify-between items-center text-slate-500">
				<span className="text-[11px] font-bold uppercase tracking-wider">
					{meta.title}
				</span>
				<Icon className={`w-4 h-4 ${meta.iconColor}`} />
			</div>
			<div className="text-2xl font-black text-slate-900 mt-2">
				{data.month}{' '}
				<span className="text-xs font-semibold text-slate-400">this month</span>
			</div>
			<div className="text-[11px] text-slate-500 mt-1">
				Value: <strong className="text-slate-800">{money(data.value)}</strong>
			</div>
		</div>
	);
};

const MiniStat = ({ label, value, icon: Icon, color }) => (
	<div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
		<div className={`p-2 rounded-lg ${color}`}>
			<Icon className="w-5 h-5" />
		</div>
		<div>
			<span className="text-[10px] font-bold uppercase text-slate-500 block">
				{label}
			</span>
			<span className="text-lg font-black text-slate-900">{value}</span>
		</div>
	</div>
);

// ---------- main ----------
export const Dashboard = ({ settings }) => {
	const navigate = useNavigate();
	const currencySymbol = '$'; //useAuthStore((s) => s.currencySymbol) || '';
	const money = (n) => formatMoney(n, currencySymbol);
	const logout = useAppStore((state)=> state.logout)

	const [stats, setStats] = useState(() => buildStats(EMPTY_DOCS));
	const [failed, setFailed] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('ALL'); // ALL | PO | SO | PI

	const { fetchProducts } = useProducts();
	useEffect(() => {
		fetchProducts().catch(console.error);
	}, [fetchProducts]);


	const handleLogout = () => {
    logout(); // Clear token and user details from Zustand
    navigate('/login', { replace: true });
};
	useEffect(() => {
		let active = true;

		const load = async () => {
			const types = Object.keys(DOC_TYPES);
			const results = await Promise.allSettled(
				types.map((t) => getList(DOC_TYPES[t].api)),
			);

			const docs = { ...EMPTY_DOCS };
			const failedTypes = [];
			results.forEach((r, i) => {
				if (r.status === 'fulfilled')
					docs[types[i]] = normalize(r.value, types[i]);
				else failedTypes.push(types[i]);
			});

			if (!active) return;
			setStats(buildStats(docs));
			setFailed(failedTypes);
			setLoading(false);
		};

		load();
		return () => {
			active = false;
		};
	}, []);

	const recentDocs = useMemo(
		() =>
			stats.recent
				.filter((d) => filter === 'ALL' || d.docType === filter)
				.slice(0, 10),
		[stats, filter],
	);

	return (
		<div className="space-y-6">
			{/* Banner */}
			<div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-2  shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6  ">
				<div className="flex items-center gap-4 ">
					<div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
						SLV
					</div>
					<div>
						<h1 className="text-l sm:text-xl font-black tracking-tight">
							{settings?.companyName || 'SILVERLINE VENTURA'}
						</h1>
						<p className="text-xs sm:text-sm text-slate-300 mt-1">
							{settings?.tagline || 'Driving excellence, delivering trust'}
						</p>
					</div>

					<button
						type="button"
						onClick={handleLogout}
						className="rounded p-2 hover:bg-white/15 hover:text-red-300 outline-none transition-colors duration-200 cursor-pointer"
						title="Logout"
					>
						<LogInIcon size={20} />
					</button>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{Object.values(DOC_TYPES).map((m) => (
						<button
							key={m.label}
							onClick={() => navigate(m.createPath)}
							className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all active:scale-95"
						>
							<Plus className="w-4 h-4" />
							<span>New {m.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Warning if any API failed */}
			{failed.length > 0 && (
				<div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-lg px-4 py-2">
					Could not load: {failed.join(', ')}. Showing available data only.
				</div>
			)}

			{/* KPI cards */}
			<div className="grid grid-cols-2 p-2 lg:grid-cols-4 gap-4">
				{Object.entries(DOC_TYPES).map(([type, meta]) => (
					<StatCard
						key={type}
						meta={meta}
						data={stats[type]}
						money={money}
						onClick={() => navigate(meta.listPath)}
					/>
				))}

				<div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
					<div className="flex justify-between items-center text-slate-500">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							Pending Conversion
						</span>
						<AlertCircle className="w-4 h-4 text-rose-600" />
					</div>
					<div className="text-2xl font-black text-rose-600 mt-2">
						{stats.PI.pendingConversion}
					</div>
					<div className="text-[11px] text-rose-700 font-medium mt-1">
						PIs not yet converted
					</div>
				</div>
			</div>

			{/* Secondary metrics */}
			<div className="grid grid-cols-2 p-2 sm:grid-cols-4 gap-4">
				<MiniStat
					label="Today's PO's"
					value={stats.PO.today}
					icon={Clock}
					color="bg-blue-100 text-blue-800"
				/>
				<MiniStat
					label="Today's SO's"
					value={stats.SO.today}
					icon={Clock}
					color="bg-emerald-100 text-emerald-800"
				/>
				<MiniStat
					label="Open Orders (PO + SO)"
					value={stats.PO.open + stats.SO.open}
					icon={Package}
					color="bg-amber-100 text-amber-800"
				/>
				<MiniStat
					label="Converted This Month"
					value={stats.convertedThisMonth}
					icon={CheckCircle2}
					color="bg-indigo-100 text-indigo-800"
				/>
			</div>

			<div className="grid grid-cols-1 p-2 lg:grid-cols-3 gap-6">
				{/* Top parties */}
				<div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
					<h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
						<Users className="w-4 h-4 text-blue-600" />
						<span>Top Suppliers & Customers</span>
					</h2>

					<div className="mt-4 space-y-3">
						{stats.topParties.length > 0 ? (
							stats.topParties.map((p) => (
								<div
									key={`${p.type}-${p.name}`}
									className="p-3 bg-slate-50 rounded-lg border border-slate-100"
								>
									<div className="flex justify-between font-bold text-xs text-slate-800">
										<span className="truncate pr-2">{p.name}</span>
										<span className="text-blue-900 shrink-0">
											{money(p.value)}
										</span>
									</div>
									<div className="flex justify-between text-[11px] text-slate-500 mt-1">
										<span>{p.type}</span>
										<span>{p.count} Documents</span>
									</div>
								</div>
							))
						) : (
							<div className="py-8 text-center text-xs text-slate-400">
								No party statistics yet.
							</div>
						)}
					</div>
				</div>

				{/* Recent documents */}
				<div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
					<div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-100">
						<h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
							<FileText className="w-4 h-4 text-blue-600" />
							<span>Recent PO / SO / PI</span>
						</h2>

						<div className="flex gap-1">
							{['ALL', 'PO', 'SO', 'PI'].map((t) => (
								<button
									key={t}
									onClick={() => setFilter(t)}
									className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
										filter === t
											? 'bg-blue-600 text-white'
											: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
									}`}
								>
									{t === 'ALL' ? 'All' : t}
								</button>
							))}
						</div>
					</div>

					<div className="mt-3 overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead className="text-[10px] font-bold text-slate-500 uppercase border-b">
								<tr>
									<th className="py-2 px-2">Type</th>
									<th className="py-2 px-2">Doc No</th>
									<th className="py-2 px-2">Date</th>
									<th className="py-2 px-2">Party</th>
									<th className="py-2 px-2 text-right">Grand Total</th>
									<th className="py-2 px-2 text-center">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{recentDocs.length > 0 ? (
									recentDocs.map((d) => (
										<tr
											key={`${d.docType}-${d.id}`}
											className="hover:bg-slate-50"
										>
											<td className="py-2.5 px-2">
												<span
													className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${DOC_TYPES[d.docType].badge}`}
												>
													{d.docType}
												</span>
											</td>
											<td className="py-2.5 px-2 font-black text-blue-900">
												{d.number}
											</td>
											<td className="py-2.5 px-2 text-slate-500">
												{formatGenericDate(d.date)}
											</td>
											<td className="py-2.5 px-2 truncate max-w-[150px]">
												{d.party}
											</td>
											<td className="py-2.5 px-2 text-right font-black text-slate-900">
												{money(d.amount)}
											</td>
											<td className="py-2.5 px-2 text-center">
												<span
													className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${STATUS_STYLE[d.status] || 'bg-slate-100 text-slate-700'}`}
												>
													{d.status || '-'}
												</span>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan="6" className="py-8 text-center text-slate-400">
											{loading
												? 'Loading...'
												: 'No recent documents available.'}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};
