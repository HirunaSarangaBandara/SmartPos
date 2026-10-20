import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { isAxiosError } from "axios";

import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  priceMinor: number;
  stockQuantity: number;
  reorderLevel: number;
  active: boolean;
}

interface ProductForm {
  name: string;
  sku: string;
  categoryId: string;
  price: string;
  reorderLevel: string;
  active: boolean;
}

interface ProductRequest {
  name: string;
  sku: string;
  categoryId: string;
  priceMinor: number;
  reorderLevel: number;
  active: boolean;
}

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  categoryId: "",
  price: "",
  reorderLevel: "10",
  active: true,
};

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;

    return (
      data?.message ??
      data?.error ??
      error.message ??
      "Request failed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

function formatPrice(priceMinor: number): string {
  return (priceMinor / 100).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ProductsPage() {
  const { role } = useAuth();

  const canManage = role === "ADMIN";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState<ProductForm>({
    ...emptyForm,
  });

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initial loading:
  // State changes happen in async callbacks, not
  // synchronously inside the effect body.
  useEffect(() => {
    let mounted = true;

    api
      .get<Product[]>("/products")
      .then((response) => {
        if (mounted) {
          setProducts(response.data);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Called after user actions, such as saving a product.
  async function refreshProducts(): Promise<void> {
    setLoading(true);

    try {
      const response =
        await api.get<Product[]>("/products");

      setProducts(response.data);
      setError("");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword) ||
        product.categoryId
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [products, search]);

  function updateForm(
    field: keyof ProductForm,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function startEdit(product: Product) {
    if (!canManage) {
      return;
    }

    setEditingId(product.id);

    setForm({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      price: (product.priceMinor / 100).toFixed(2),
      reorderLevel: String(product.reorderLevel),
      active: product.active,
    });

    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!canManage) {
      setError("Only Admin users can modify products.");
      return;
    }

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const sku = form.sku.trim();
    const categoryId = form.categoryId.trim();

    const price = Number(form.price);
    const reorderLevel = Number(form.reorderLevel);

    if (!name || !sku || !categoryId) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Enter a valid product price.");
      return;
    }

    if (
      form.reorderLevel.trim() === "" ||
      !Number.isInteger(reorderLevel) ||
      reorderLevel < 0
    ) {
      setError("Enter a valid reorder level.");
      return;
    }

    const payload: ProductRequest = {
      name,
      sku,
      categoryId,
      priceMinor: Math.round(price * 100),
      reorderLevel,
      active: form.active,
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(
          `/products/${encodeURIComponent(editingId)}`,
          payload
        );

        setSuccess("Product updated successfully.");
      } else {
        await api.post("/products", payload);

        setSuccess("Product created successfully.");
      }

      resetForm();
      await refreshProducts();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(product: Product) {
    if (!canManage) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.patch(
        `/products/${encodeURIComponent(
          product.id
        )}/status`,
        {
          active: !product.active,
        }
      );

      setSuccess(
        product.active
          ? "Product deactivated successfully."
          : "Product activated successfully."
      );

      await refreshProducts();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Product Management
        </h1>

        <p className="mt-2 text-gray-500">
          Manage the SmartPOS product catalog.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
        >
          {success}
        </div>
      )}

      {canManage && (
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="product-name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>

              <input
                id="product-name"
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  updateForm("name", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                placeholder="Pencil"
              />
            </div>

            <div>
              <label
                htmlFor="product-sku"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                SKU
              </label>

              <input
                id="product-sku"
                type="text"
                required
                value={form.sku}
                onChange={(event) =>
                  updateForm("sku", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                placeholder="PEN-001"
              />
            </div>

            <div>
              <label
                htmlFor="product-category"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Category ID
              </label>

              <input
                id="product-category"
                type="text"
                required
                value={form.categoryId}
                onChange={(event) =>
                  updateForm(
                    "categoryId",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                placeholder="stationery"
              />
            </div>

            <div>
              <label
                htmlFor="product-price"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Price (LKR)
              </label>

              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(event) =>
                  updateForm("price", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                placeholder="50.00"
              />
            </div>

            <div>
              <label
                htmlFor="product-reorder"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Reorder Level
              </label>

              <input
                id="product-reorder"
                type="number"
                min="0"
                step="1"
                required
                value={form.reorderLevel}
                onChange={(event) =>
                  updateForm(
                    "reorderLevel",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="product-status"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="product-status"
                value={form.active ? "active" : "inactive"}
                onChange={(event) =>
                  updateForm(
                    "active",
                    event.target.value === "active"
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              >
                <option value="active">Active</option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-gray-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Product Catalog
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {products.length} products
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, SKU, category..."
              aria-label="Search products"
              className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />

            <button
              type="button"
              onClick={() => {
                void refreshProducts();
              }}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-gray-500">
            Loading products...
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No products found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-700">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price (LKR)</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>

                  {canManage && (
                    <th className="p-3">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b"
                  >
                    <td className="p-3 font-medium">
                      {product.name}
                    </td>

                    <td className="p-3">
                      {product.sku}
                    </td>

                    <td className="p-3">
                      {product.categoryId}
                    </td>

                    <td className="p-3">
                      {formatPrice(product.priceMinor)}
                    </td>

                    <td className="p-3">
                      {product.stockQuantity ?? 0}
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          product.active
                            ? "rounded-full bg-green-100 px-3 py-1 text-green-700"
                            : "rounded-full bg-gray-100 px-3 py-1 text-gray-600"
                        }
                      >
                        {product.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {canManage && (
                      <td className="p-3">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(product)
                            }
                            className="font-medium text-blue-600"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              void toggleStatus(product);
                            }}
                            className="font-medium text-gray-700"
                          >
                            {product.active
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}