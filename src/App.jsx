import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
// import PurchaseOrder from './components/purchase_order/PurchaseOrder';

import PurchaseOrderDashboard from './features/dashboard/PurchaseOrderDsashboard';
import SaleOrderDashboard from './features/dashboard/SaleOrderDashboard';

import { Toaster } from 'sonner';
import { Dashboard } from './features/dashboard/Dashboard';
import AsideView from './features/dashboard/AsideView';

import PurchasePrint from './components/print/PurchasePrint';
import PurchaseOrder from './features/purchase_order/page/PurchaseOrder';

const App = () => {
	return (

		<BrowserRouter>
		<Toaster richColors={true }/>
			<Routes>
				<Route path='/' element={<LoginPage />} />
				<Route path='/dashboard/po' element={<PurchaseOrderDashboard />} />
				<Route path='/dashboard/so' element={<SaleOrderDashboard />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/po" element={<PurchaseOrder />} />
				{/* <Route path='/so' element={<SaleOrder />} /> */}
				<Route path='/dashboard' element={<Dashboard />} />
				
				{/* <Route path='/pi' element={<ProformaInvoice />} /> */}
				<Route path='/as' element={<AsideView />} />
				<Route path='/print' element={<PurchasePrint />} />
			</Routes>
		</BrowserRouter>
	);
};
export default App;
