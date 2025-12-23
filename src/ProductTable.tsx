import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, DollarSign, Calendar, AlertCircle, Search, Hash, FileText, BarChart3 } from 'lucide-react';

interface Product {
  producto: string;
  precio: string;
  date: string;
  cantidad?: string | number;
  detalles?: string;
}

function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [showStockView, setShowStockView] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.opuskeys.com/api/sahli_table', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();

      const sortedProducts = [...data].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      setProducts(sortedProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'N/A';
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  };

  const filteredProducts = products.filter((product) =>
    product.producto.toLowerCase().includes(filterText.toLowerCase())
  );

  const getStockSummary = () => {
    const stockMap = new Map<string, { producto: string; totalQuantity: number; precio: string; detalles: string }>();

    products.forEach((product) => {
      const quantity = typeof product.cantidad === 'string' ? parseFloat(product.cantidad) : (product.cantidad || 0);

      if (stockMap.has(product.producto)) {
        const existing = stockMap.get(product.producto)!;
        existing.totalQuantity += quantity;
      } else {
        stockMap.set(product.producto, {
          producto: product.producto,
          totalQuantity: quantity,
          precio: product.precio,
          detalles: product.detalles || 'N/A'
        });
      }
    });

    return Array.from(stockMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
  };

  const stockSummary = getStockSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)] -z-10" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-md opacity-75" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Product Catalog</h1>
              <p className="text-slate-400 text-sm mt-1">Recent products and pricing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStockView(!showStockView)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all duration-200 text-sm font-medium border border-emerald-500"
            >
              <BarChart3 className="w-4 h-4" />
              {showStockView ? 'Show All' : 'Show Stock Summary'}
            </button>
            <button
              onClick={fetchProducts}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by product name..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {isLoading && products.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">{products.length === 0 ? 'No products found' : 'No products match your filter'}</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {!showStockView && (
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300 bg-slate-800/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          Fecha
                        </div>
                      </th>
                    )}
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300 bg-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-emerald-400" />
                        Producto
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300 bg-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-emerald-400" />
                        Cantidad
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300 bg-slate-800/80">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        Precio
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300 bg-slate-800/80">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        Detalles
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showStockView ? (
                    stockSummary.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="text-slate-100 font-medium">{item.producto}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-emerald-400 font-semibold text-lg">
                            {item.totalQuantity}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-emerald-400 font-semibold">
                            {formatPrice(item.precio)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-300 text-sm">
                            {item.detalles}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredProducts.map((product, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="text-slate-400 text-sm">{formatDate(product.date)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-100 font-medium">{product.producto}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-300 text-sm">
                            {product.cantidad ?? 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-emerald-400 font-semibold">
                            {formatPrice(product.precio)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-300 text-sm">
                            {product.detalles || 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-800/80 border-t border-slate-700/50">
              <p className="text-sm text-slate-500 text-center">
                {showStockView
                  ? `Showing ${stockSummary.length} unique ${stockSummary.length === 1 ? 'product' : 'products'} with aggregated stock`
                  : `Showing ${filteredProducts.length} of ${products.length} ${products.length === 1 ? 'product' : 'products'} sorted by most recent`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductTable;
