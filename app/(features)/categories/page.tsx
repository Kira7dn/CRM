import { getCategoriesAction, createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions"
import type { Category } from "@/core/domain/category"

export default async function CategoriesPage() {
    const categories = await getCategoriesAction()

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Categories</h1>

            {/* Create Category Form */}
            <div className="mb-6 p-4 border rounded">
                <h2 className="text-lg font-semibold mb-2">Create Category</h2>
                <form action={createCategoryAction} className="space-y-2">
                    <input
                        name="name"
                        placeholder="Category name"
                        className="border p-2 rounded w-full"
                        required
                    />
                    <input
                        name="image"
                        placeholder="Image URL"
                        className="border p-2 rounded w-full"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Create
                    </button>
                </form>
            </div>

            {/* Categories List */}
            <div className="grid gap-4">
                {categories.map((category: Category) => (
                    <div key={category.id} className="p-4 border rounded flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-gray-600">{category.image}</p>
                        </div>
                        <div className="space-x-2">
                            {/* Update Form */}
                            <form action={updateCategoryAction} className="inline">
                                <input type="hidden" name="id" value={category.id} />
                                <input
                                    name="name"
                                    defaultValue={category.name}
                                    className="border p-1 text-sm"
                                />
                                <input
                                    name="image"
                                    defaultValue={category.image}
                                    className="border p-1 text-sm ml-1"
                                />
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-2 py-1 text-sm rounded ml-1"
                                >
                                    Update
                                </button>
                            </form>

                            {/* Delete Button - use form with hidden input */}
                            <form action={deleteCategoryAction} className="inline">
                                <input type="hidden" name="id" value={category.id} />
                                <button
                                    type="submit"
                                    className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                                >
                                    Delete
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
