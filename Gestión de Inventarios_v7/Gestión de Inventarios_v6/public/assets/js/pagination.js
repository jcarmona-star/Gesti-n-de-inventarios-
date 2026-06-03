/**
 * pagination.js
 * Sistema de paginación reutilizable para todos los módulos
 * Muestra 10 registros por página con navegación
 */

class Pagination {
    constructor(items, itemsPerPage = 10) {
        this.items = items;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalPages = Math.ceil(items.length / itemsPerPage);
    }

    /**
     * Obtiene los items de la página actual
     */
    getCurrentPageItems() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.items.slice(startIndex, endIndex);
    }

    /**
     * Navega a una página específica
     */
    goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.currentPage = pageNumber;
            return true;
        }
        return false;
    }

    /**
     * Página siguiente
     */
    nextPage() {
        return this.goToPage(this.currentPage + 1);
    }

    /**
     * Página anterior
     */
    previousPage() {
        return this.goToPage(this.currentPage - 1);
    }

    /**
     * Actualiza los items (útil cuando se agregan/eliminan registros)
     */
    updateItems(newItems) {
        this.items = newItems;
        this.totalPages = Math.ceil(newItems.length / this.itemsPerPage);
        // Ajustar página actual si es necesario
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }
    }

    /**
     * Genera HTML para controles de paginación
     */
    renderControls(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let pagesHTML = '';
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

        // Ajustar si estamos cerca del final
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Botón primera página
        if (startPage > 1) {
            pagesHTML += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                pagesHTML += `<span class="page-dots">...</span>`;
            }
        }

        // Páginas numeradas
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            pagesHTML += `<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`;
        }

        // Botón última página
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                pagesHTML += `<span class="page-dots">...</span>`;
            }
            pagesHTML += `<button class="page-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
        }

        container.innerHTML = `
      <div class="pagination-controls">
        <button class="page-nav" id="prevPage" ${this.currentPage === 1 ? 'disabled' : ''}>
          ← Anterior
        </button>
        <div class="page-numbers">
          ${pagesHTML}
        </div>
        <button class="page-nav" id="nextPage" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
          Siguiente →
        </button>
        <span class="page-info">
          Página ${this.currentPage} de ${this.totalPages} (${this.items.length} registros)
        </span>
      </div>
    `;

        // Event listeners
        const prevBtn = container.querySelector('#prevPage');
        const nextBtn = container.querySelector('#nextPage');
        const pageButtons = container.querySelectorAll('.page-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.previousPage()) {
                    this.onPageChange();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.nextPage()) {
                    this.onPageChange();
                }
            });
        }

        pageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (this.goToPage(page)) {
                    this.onPageChange();
                }
            });
        });
    }

    /**
     * Callback cuando cambia la página (debe ser sobrescrito)
     */
    onPageChange() {
        // Implementar en cada módulo
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pagination;
}
