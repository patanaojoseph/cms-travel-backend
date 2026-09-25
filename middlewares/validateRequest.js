export const validateRequest =
  (schema, target = "body") =>
  async (req, res, next) => {
    try {
      // parseAsync handles both sync & async Zod refinements
      const parsedData = await schema.parseAsync(req[target]);

      // Replace req body/params/query with parsed & sanitized data
      req[target] = parsedData;

      next();
    } catch (err) {
      if (err.name === "ZodError") {
        // Map error messages cleanly for the client
        const errors = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors,
        });
      }

      // Forward unexpected errors to global error handler
      next(err);
    }
  };
