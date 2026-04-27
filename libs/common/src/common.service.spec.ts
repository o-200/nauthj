import { CommonService } from './common.service';

describe('CommonService', () => {
  let service: CommonService;

  beforeEach(() => {
    service = new CommonService();
  });

  describe('separateFields', () => {
    it('should return only changed allowed fields', () => {
      const entity = {
        id: 1,
        login: 'old_login',
        email: 'old@example.com',
        age: 20,
      };

      const updateDto = {
        login: 'new_login',
        email: 'old@example.com',
        age: 21,
      };

      const allowedFields = ['login', 'email', 'age'] as const;

      const result = service.separateFields(entity, updateDto, allowedFields);

      expect(result).toEqual({
        login: 'new_login',
        age: 21,
      });
    });

    it('should ignore fields with undefined values', () => {
      const entity = {
        login: 'alex',
        email: 'alex@example.com',
      };

      const updateDto = {
        login: undefined,
        email: 'new@example.com',
      };

      const allowedFields = ['login', 'email'] as const;

      const result = service.separateFields(entity, updateDto, allowedFields);

      expect(result).toEqual({
        email: 'new@example.com',
      });
    });

    it('should return empty object when nothing changed', () => {
      const entity = {
        login: 'alex',
        email: 'alex@example.com',
      };

      const updateDto = {
        login: 'alex',
        email: 'alex@example.com',
      };

      const allowedFields = ['login', 'email'] as const;

      const result = service.separateFields(entity, updateDto, allowedFields);

      expect(result).toEqual({});
    });

    it('should ignore fields not included in allowedFields', () => {
      const entity = {
        login: 'alex',
        email: 'alex@example.com',
        role: 'user',
      };

      const updateDto = {
        login: 'new_alex',
        email: 'new@example.com',
        role: 'admin',
      };

      const allowedFields = ['login', 'email'] as const;

      const result = service.separateFields(entity, updateDto, allowedFields);

      expect(result).toEqual({
        login: 'new_alex',
        email: 'new@example.com',
      });
      expect(result).not.toHaveProperty('role');
    });

    it('should return empty object when updateDto is empty', () => {
      const entity = {
        login: 'alex',
        email: 'alex@example.com',
      };

      const updateDto = {};

      const allowedFields = ['login', 'email'] as const;

      const result = service.separateFields(entity, updateDto, allowedFields);

      expect(result).toEqual({});
    });

    it('should work with nullable values', () => {
      const entity = {
        bio: 'hello',
        avatar: 'avatar.png',
      };

      const updateDto = {
        bio: null,
        avatar: 'avatar.png',
      };

      const allowedFields = ['bio', 'avatar'] as const;

      const result = service.separateFields(entity, updateDto, allowedFields);

      expect(result).toEqual({
        bio: null,
      });
    });
  });
});
