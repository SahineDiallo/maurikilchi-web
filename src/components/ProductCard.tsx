import { type Product } from '../lib/api'

interface Props { item: Product }

export default function ProductCard({ item }: Props) {
  const image = item.primary_image_url ?? item.primary_image ?? item.images?.[0]?.image_url ?? null

  return (
    <a href={`/produit/${item.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* Image wrap — matches mobile imgWrap (p-2 + rounded-xl inside) */}
      <div className="p-2">
        <div className="relative rounded-xl overflow-hidden h-36 sm:h-52 bg-amber-50">
          {image ? (
            <img src={image} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl select-none">📦</div>
          )}
          {item.category_name && (
            <span className="absolute top-2 left-2 bg-black/50 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md leading-none">
              {item.category_name}
            </span>
          )}
        </div>
      </div>

      {/* Text info — matches mobile info section */}
      <div className="px-2.5 pb-3 pt-0.5">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1.5">
          {item.title}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-[15px] font-bold text-gray-900">
            {parseFloat(item.price).toLocaleString('fr-FR')}
          </span>
          <span className="text-xs text-gray-400 font-medium">MRU</span>
        </div>
        {item.boutique_name && (
          <p className="text-[10px] text-gray-400 mt-1 truncate">📍 {item.boutique_name}</p>
        )}
      </div>
    </a>
  )
}
