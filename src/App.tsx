import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Categories } from "./pages/Categories";
import { NotFound } from "./pages/NotFound";
import { Products } from "./pages/Products";
import { CreateProduct } from "./pages/CreateProduct";
import Customers from "./pages/Customers";
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
