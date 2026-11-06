import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import PurchaseOrder from './components/purchase_order/PurchaseOrder';
import SaleOrder from './components/sale_order/SaleOrder';
import PurchaseOrderDashboard from './components/dashboard/PurchaseOrderDsashboard';
import SaleOrderDashboard from './components/dashboard/SaleOrderDashboard';
import ProformaInvoice from './components/proforma_invoice/ProformaInvoice';
import { Toaster } from 'sonner';
import { Dashboard } from './components/dashboard/Dashboard';
import AsideView from './components/dashboard/AsideView';

import PurchasePrint from './components/print/PurchasePrint';

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
				<Route path='/so' element={<SaleOrder />} />
				<Route path='/dashboard' element={<Dashboard />} />
				
				<Route path='/pi' element={<ProformaInvoice />} />
				<Route path='/as' element={<AsideView />} />
				<Route path='/print' element={<PurchasePrint />} />
			</Routes>
		</BrowserRouter>
	);
};
export default App;
