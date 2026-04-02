export default function SearchFilters({ filters, setFilters, categories, onSearch }) {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-5">
      <input
        placeholder="Search items"
        value={filters.query}
        onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
      />
      <select value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}>
        <option value="">All categories</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <input
        placeholder="Location"
        value={filters.location}
        onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
      />
      <div className="flex gap-3">
        <input
          placeholder="Min €"
          type="number"
          value={filters.minPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
        />
        <input
          placeholder="Max €"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
        />
      </div>
      <button onClick={onSearch} className="rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">Search</button>
    </div>
  );
}
