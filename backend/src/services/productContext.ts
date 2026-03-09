// productContext.ts
// Construye un string de contexto con los productos y categorías actuales
// de Supabase para inyectarlo en el system prompt de Gemini.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? '';

// Usamos el service_role key para leer datos sin restricciones RLS
const supabase = createClient(supabaseUrl, supabaseKey);

export async function buildProductContext(): Promise<string> {
    try {
        // Cargamos productos activos con su categoría e imagen
        const { data: products, error: productError } = await supabase
            .from('products')
            .select('id, name, description, price, image_url, categories(name)')
            .eq('is_active', true)
            .order('id', { ascending: true });

        if (productError) {
            console.error('[productContext] Error fetching products:', productError.message);
            return 'No se pudo cargar el catálogo de productos en este momento.';
        }

        // Cargamos las categorías disponibles
        const { data: categories, error: categoryError } = await supabase
            .from('categories')
            .select('name, description')
            .order('name', { ascending: true });

        if (categoryError) {
            console.error('[productContext] Error fetching categories:', categoryError.message);
        }

        // Construimos el resumen de categorías
        const categoryList = (categories ?? [])
            .map((c: { name: string; description?: string | null }) =>
                `  - ${c.name}${c.description ? `: ${c.description}` : ''}`
            )
            .join('\n');

        // Construimos el listado de productos
        const productList = (products ?? [])
            .map((p: {
                id: number;
                name: string;
                description?: string | null;
                price?: number | null;
                image_url?: string | null;
                categories?: { name: string } | { name: string }[] | null;
            }) => {
                const categoryName = Array.isArray(p.categories)
                    ? p.categories[0]?.name ?? 'Sin categoría'
                    : (p.categories as { name: string } | null)?.name ?? 'Sin categoría';

                const price = p.price != null
                    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(p.price))
                    : 'Precio no disponible';
                const image = p.image_url ? `[Imagen: ${p.image_url}]` : '[Sin imagen]';

                return `  [ID:${p.id}] ${p.name} (${categoryName}) — ${price} — ${image}\n    ${p.description ?? 'Sin descripción'}`;
            })
            .join('\n\n');

        return [
            '=== CATÁLOGO ACTUAL DE AURA ===',
            '',
            'CATEGORÍAS DISPONIBLES:',
            categoryList || '  (sin categorías)',
            '',
            'PRODUCTOS:',
            productList || '  (sin productos)',
            '',
            '================================',
        ].join('\n');

    } catch (err) {
        console.error('[productContext] Unexpected error:', err);
        return 'El catálogo no está disponible en este momento.';
    }
}
