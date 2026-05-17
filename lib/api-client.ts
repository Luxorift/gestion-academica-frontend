/**
 * Cliente API para conectar con el backend NuevaSchool
 * Maneja autenticación, headers y errores
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtiene el token JWT del localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const auth = localStorage.getItem('nuevaschool_auth');
      if (auth) {
        const authData = JSON.parse(auth);
        return authData.access_token || null;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return null;
  }

  /**
   * Construye los headers con autorización
   */
  private getHeaders(contentType: string = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Realiza una solicitud GET
   */
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new ApiClientError(response.status, await response.text());
      }

      return await response.json() as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Realiza una solicitud POST
   */
  async post<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiClientError(response.status, await response.text());
      }

      return await response.json() as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Realiza una solicitud PUT
   */
  async put<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiClientError(response.status, await response.text());
      }

      return await response.json() as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Realiza una solicitud DELETE
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new ApiClientError(response.status, await response.text());
      }

      return await response.json() as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Maneja errores de API
   */
  private handleError(error: unknown): ApiError {
    if (error instanceof ApiClientError) {
      return {
        status: error.status,
        message: error.message,
      };
    }

    if (error instanceof Error) {
      return {
        status: 0,
        message: error.message,
      };
    }

    return {
      status: 0,
      message: 'Error desconocido',
    };
  }
}

class ApiClientError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const apiClient = new ApiClient();
