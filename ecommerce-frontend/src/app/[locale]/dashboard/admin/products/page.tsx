import { getStoreProducts, type StoreProduct } from "~/features/store/actions/StoreActions";
import ProductDashboard from "./components/ProductDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const adminId = "b05aebfd-2b55-450e-b5f7-ee42e53c6250";
  const products: StoreProduct[] = await getStoreProducts(adminId, 500);

  return <ProductDashboard products={products} adminId={adminId} />;
}