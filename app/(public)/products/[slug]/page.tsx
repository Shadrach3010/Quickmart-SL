import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/marketplace/product-card";
import { ProductImage } from "@/components/marketplace/product-image";
import { SectionHeading } from "@/components/marketplace/section-heading";
import { ProductPurchasePanel } from "@/features/catalog/components/product-purchase-panel";
import { ProductReviews } from "@/features/engagement";
import { getProductBySlug, listProducts } from "@/services/catalog";
import { listProductReviews } from "@/services/engagement";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const [categoryProducts, reviews] = await Promise.all([
    listProducts({ categoryId: product.categoryId, limit: 5 }),
    listProductReviews(product.id),
  ]);
  const related = categoryProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  return (
    <div className="marketplace-container py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-[5rem_1fr]">
          {product.imageUrls.length > 1 && (
            <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
              {product.imageUrls.map((image, index) => (
                <ProductImage
                  alt={`${product.name} view ${index + 1}`}
                  className="aspect-square w-20 shrink-0 rounded-xl border"
                  key={image}
                  src={image}
                />
              ))}
            </div>
          )}
          <ProductImage
            alt={product.name}
            className="order-1 aspect-square rounded-3xl border sm:order-2"
            src={product.imageUrls[0]}
          />
        </div>
        <ProductPurchasePanel product={product} />
      </div>
      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading title="You may also like" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
      <ProductReviews initialReviews={reviews} product={product} />
    </div>
  );
}
