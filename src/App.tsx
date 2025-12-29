import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Categories } from "./pages/Categories";
import { NotFound } from "./pages/NotFound";
import { Products } from "./pages/Products";
import { CreateProduct } from "./pages/CreateProduct";
import Customers from "./pages/Customers";
import { Configurations } from "./pages/Configurations";
import { ProductDetails } from "./pages/ProductDetails";
import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products/>} />
          <Route path="/products/new" element={<CreateProduct />} />
          <Route path="/products/:id/edit" element={<CreateProduct />} />
          <Route path="/settings/configurations" element={<Configurations />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/products/:id" element={<ProductDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
