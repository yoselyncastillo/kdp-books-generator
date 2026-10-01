'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Book } from '@/types';

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    const data = await api.getBooks();
    setBooks(data);
    setIsLoading(false);
  };

  const handleCreateBook = async () => {
    const title = prompt('Ingresa el título del nuevo proyecto:');
    if (!title) return;
    
    const newBook = await api.createBook(title);
    router.push(`/editor/${newBook.id}`);
  };

  const handleEditBook = (id: string) => {
    router.push(`/editor/${id}`);
  };

  const handleDeleteBook = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres borrar este proyecto?')) {
      await api.deleteBook(id);
      fetchBooks();
    }
  };

  const handleDuplicateBook = async (id: string) => {
    const duplicated = await api.duplicateBook(id);
    fetchBooks();
    alert(`Proyecto duplicado con éxito: ${duplicated.title}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">Publicado</span>;
      case 'ready_for_kdp':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">Listo para KDP</span>;
      case 'draft':
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full font-medium">Borrador</span>;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Cargando dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Proyectos KDP</h1>
            <p className="text-gray-500 mt-2">Gestiona tus libros de sopas de letras</p>
          </div>
          <button 
            onClick={handleCreateBook}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all flex items-center gap-2"
          >
            <span>+</span> Nuevo Proyecto
          </button>
        </div>

        {/* Grid de proyectos */}
        {books.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <h2 className="text-xl font-medium text-gray-700 mb-2">No tienes proyectos aún</h2>
            <p className="text-gray-500 mb-6">Crea tu primer libro para empezar a generar contenido para KDP.</p>
            <button 
              onClick={handleCreateBook}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md font-medium transition-all"
            >
              Crear mi primer proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map(book => (
              <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(book.status)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                  <div className="text-sm text-gray-500 mb-4">
                    <p>Creado: {new Date(book.createdAt).toLocaleDateString()}</p>
                    <p>Actualizado: {new Date(book.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center gap-2">
                  <button 
                    onClick={() => router.push(`/view/${book.id}`)}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 w-10 h-10 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                    title="Solo ver"
                  >
                    👁️
                  </button>
                  <button 
                    onClick={() => handleEditBook(book.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex-grow bg-indigo-50 hover:bg-indigo-100 py-2 rounded-md text-center transition-colors cursor-pointer"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => handleDuplicateBook(book.id)}
                    className="text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                    title="Duplicar"
                  >
                    📄
                  </button>
                  <button 
                    onClick={() => handleDeleteBook(book.id)}
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 w-10 h-10 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                    title="Borrar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
