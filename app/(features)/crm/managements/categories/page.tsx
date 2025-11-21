import { getCategoriesAction } from "./actions"
import { CategoryList } from "./_components/CategoryList"

export default async function CategoriesPage() {
    const categories = await getCategoriesAction()

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Categories</h1>
            <CategoryList initialCategories={categories} />
        </div>
    )
}
