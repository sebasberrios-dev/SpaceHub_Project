const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "SpaceHub API",
    version: "1.0.0",
    description:
      "API para gestión de espacios de coworking, reservas y membresías",
  },
  servers: [{ url: "http://localhost:3000/api" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["member", "admin"] },
        },
      },
      Space: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          type: {
            type: "string",
            enum: ["individual_desk", "private_room", "business_suite"],
          },
          capacity: { type: "integer" },
          pricePerHour: { type: "number" },
          location: { type: "string" },
          isActive: { type: "boolean" },
        },
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          spaceId: { type: "integer" },
          startTime: { type: "string", format: "date-time" },
          endTime: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["confirmed", "canceled"] },
          totalPrice: { type: "number" },
        },
      },
      Membership: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          plan: { type: "string", enum: ["basic", "pro", "enterprise"] },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar nuevo usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Usuario creado" },
          "500": {
            description: "Error del servidor",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login exitoso, retorna token JWT" },
          "401": {
            description: "Credenciales inválidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/spaces": {
      get: {
        tags: ["Spaces"],
        summary: "Listar espacios activos",
        parameters: [
          {
            name: "type",
            in: "query",
            schema: { type: "string" },
            description: "Filtrar por tipo de espacio",
          },
          {
            name: "minCapacity",
            in: "query",
            schema: { type: "integer" },
            description: "Capacidad mínima",
          },
          {
            name: "date",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Filtrar por disponibilidad en fecha (YYYY-MM-DD)",
          },
        ],
        responses: {
          "200": {
            description: "Lista de espacios activos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Space" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Spaces"],
        summary: "Crear espacio (solo admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "name",
                  "type",
                  "capacity",
                  "pricePerHour",
                  "location",
                ],
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  capacity: { type: "integer" },
                  pricePerHour: { type: "number" },
                  location: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Espacio creado" },
          "401": { description: "Token requerido" },
          "403": { description: "Acceso solo para administradores" },
        },
      },
    },
    "/spaces/{id}": {
      get: {
        tags: ["Spaces"],
        summary: "Obtener detalle de un espacio",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Detalle del espacio",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Space" },
              },
            },
          },
          "404": { description: "Espacio no encontrado" },
        },
      },
      put: {
        tags: ["Spaces"],
        summary: "Actualizar espacio (solo admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  capacity: { type: "integer" },
                  pricePerHour: { type: "number" },
                  location: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Espacio actualizado" },
          "401": { description: "Token requerido" },
          "403": { description: "Acceso solo para administradores" },
          "404": { description: "Espacio no encontrado" },
        },
      },
      delete: {
        tags: ["Spaces"],
        summary: "Desactivar espacio (solo admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Espacio desactivado" },
          "401": { description: "Token requerido" },
          "403": { description: "Acceso solo para administradores" },
          "404": { description: "Espacio no encontrado" },
        },
      },
    },
    "/reservations": {
      get: {
        tags: ["Reservations"],
        summary: "Listar reservas (miembro ve las suyas, admin ve todas)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de reservas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Booking" },
                },
              },
            },
          },
          "401": { description: "Token requerido" },
        },
      },
      post: {
        tags: ["Reservations"],
        summary: "Crear reserva (solo miembros)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["spaceId", "startTime", "endTime"],
                properties: {
                  spaceId: { type: "integer" },
                  startTime: { type: "string", format: "date-time" },
                  endTime: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Reserva creada" },
          "401": { description: "Token requerido" },
          "403": { description: "Solo miembros pueden crear reservas" },
          "404": { description: "Espacio no encontrado o inactivo" },
          "409": { description: "Conflicto de horario" },
        },
      },
    },
    "/reservations/{id}": {
      get: {
        tags: ["Reservations"],
        summary: "Obtener detalle de una reserva",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Detalle de la reserva" },
          "401": { description: "Token requerido" },
          "403": { description: "Acceso denegado" },
          "404": { description: "Reserva no encontrada" },
        },
      },
    },
    "/reservations/{id}/cancel": {
      patch: {
        tags: ["Reservations"],
        summary: "Cancelar reserva",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Reserva cancelada" },
          "401": { description: "Token requerido" },
          "403": { description: "No podés cancelar reservas ajenas" },
          "404": { description: "Reserva no encontrada" },
        },
      },
    },
    "/memberships": {
      get: {
        tags: ["Memberships"],
        summary: "Listar membresías activas (solo admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Lista de membresías con datos del usuario" },
          "401": { description: "Token requerido" },
          "403": { description: "Acceso solo para administradores" },
        },
      },
    },
    "/memberships/{userId}": {
      patch: {
        tags: ["Memberships"],
        summary: "Actualizar plan de membresía (solo admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["plan"],
                properties: {
                  plan: {
                    type: "string",
                    enum: ["basic", "pro", "enterprise"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Membresía actualizada" },
          "401": { description: "Token requerido" },
          "403": { description: "Acceso solo para administradores" },
          "404": { description: "Membresía no encontrada" },
        },
      },
    },
  },
};

export default openApiSpec;
