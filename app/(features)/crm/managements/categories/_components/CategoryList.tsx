"use client"

import { useState } from "react"
import type { Category } from "@/core/domain/managements/category"
import { deleteCategoryAction } from "../actions"
import { CategoryForm } from "./CategoryForm"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@shared/ui/card"

interface CategoryListProps {
  initialCategories: Category[]
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = !searchQuery ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return
    }

    try {
      await deleteCategoryAction(id)
      setCategories(categories.filter((c) => c.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete category")
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <div>
      {/* Filters & Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 flex-1"
        />

        {/* Add Category Button */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Category
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            {/* Category Image */}
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover"
              />
            )}

            <CardHeader>
              <CardTitle className="text-lg">
                {category.name}
              </CardTitle>
              <CardDescription className="text-xs break-all">
                {category.image}
              </CardDescription>
            </CardHeader>

            <CardFooter>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                >
                  Delete
                </button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No categories found
        </div>
      )}

      {/* Category Form Modal */}
      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
