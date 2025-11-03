const db = require('../database/connection');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.profileImage = data.profile_image;
    this.bio = data.bio;
    this.isActive = data.is_active;
    this.isVerified = data.is_verified;
    this.role = data.role;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.lastLogin = data.last_login;
  }

  // Create a new user
  static async create(userData) {
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, profile_image, bio, is_active, is_verified, role, created_at, updated_at, last_login
    `;
    
    const values = [
      userData.email,
      userData.passwordHash,
      userData.firstName,
      userData.lastName,
      userData.role || 'student'
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = `
      SELECT id, email, password_hash, first_name, last_name, profile_image, bio, 
             is_active, is_verified, role, created_at, updated_at, last_login
      FROM users 
      WHERE email = $1 AND is_active = true
    `;

    try {
      const result = await db.query(query, [email]);
      return result.rows[0] ? { 
        ...new User(result.rows[0]), 
        passwordHash: result.rows[0].password_hash 
      } : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = `
      SELECT id, email, first_name, last_name, profile_image, bio, 
             is_active, is_verified, role, created_at, updated_at, last_login
      FROM users 
      WHERE id = $1 AND is_active = true
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Update last login time
  static async updateLastLogin(id) {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING last_login
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0]?.last_login;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbKey = this.camelToSnake(key);
        fields.push(`${dbKey} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(this.id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, profile_image, bio, 
                is_active, is_verified, role, created_at, updated_at, last_login
    `;

    try {
      const result = await db.query(query, values);
      if (result.rows[0]) {
        const updatedUser = new User(result.rows[0]);
        Object.assign(this, updatedUser);
      }
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to convert camelCase to snake_case
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      profileImage: this.profileImage,
      bio: this.bio,
      isActive: this.isActive,
      isVerified: this.isVerified,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin
    };
  }
}

module.exports = User;