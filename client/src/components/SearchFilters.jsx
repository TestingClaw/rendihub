export default function SearchFilters({ filters, setFilters, categories, onSearch }) {
  return (
    <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm md:grid-cols-5">
      <input
        placeholder="Otsi..."
        value={filters.query}
        onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
      />
      <select value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}>
        <option value="">K&otilde;ik kategooriad</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <input
        placeholder="Asukoht"
        value={filters.location}
        onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
      />
      <div className="flex gap-3">
        <input
          placeholder="Min &euro;"
          type="number"
          value={filters.minPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
        />
        <input
          placeholder="Max &euro;"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
        />
      </div>
      <button onClick={onSearch} className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/25">Otsi</button>
    </div>
  );
}
