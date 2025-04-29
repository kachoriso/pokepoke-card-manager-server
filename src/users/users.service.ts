import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, t_users as User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  /**
   * 新しいユーザーを作成する
   * AuthService から呼び出され、ハッシュ化済みのパスワードを含むデータを受け取る
   * @param data Prisma が要求するユーザー作成用データ (例: { email, username, password_hash })
   * @returns 作成されたユーザーオブジェクト
   */
  async create(data: Prisma.t_usersCreateInput): Promise<User> {
    return this.prisma.t_users.create({
      data,
    });
  }

  /**
   * メールアドレスでユーザーを検索する
   * 登録時の重複チェックやログイン時のユーザー検証で使用
   * @param email 検索するメールアドレス
   * @returns 見つかったユーザーオブジェクト、または null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.t_users.findUnique({
      where: { email }
    });
  }

  /**
   * ID (UUID) でユーザーを検索する
   * JWT ストラテジーで、トークン内のユーザーIDからユーザー情報を復元する際に使用
   * @param id 検索するユーザーID (UUID文字列)
   * @returns 見つかったユーザーオブジェクト、または null
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.t_users.findUnique({ where: { id } });
  }

  /**
   * (任意) 全てのユーザーを取得するメソッドの例
   * 必要に応じて、パスワードハッシュを除外したり、ページネーションを追加したりします
   * @returns ユーザーオブジェクトの配列 (パスワードハッシュを除く例)
   */
  async findAll(): Promise<Omit<User, 'password_hash'>[]> {
    return this.prisma.t_users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        poke_poke_id: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  /**
   * (任意) ユーザー情報を更新するメソッドの例
   * @param id 更新するユーザーのID
   * @param data 更新するデータ (Prisma.UserUpdateInput 型)
   * @returns 更新後のユーザーオブジェクト
   */
  async update(id: string, data: Prisma.t_usersUpdateInput): Promise<User> {
    try {
      return await this.prisma.t_users.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`ユーザー ID ${id} が見つかりません`);
      }
      throw error;
    }
  }

  /**
   * (任意) ユーザーを削除するメソッドの例
   * @param id 削除するユーザーのID
   * @returns 削除されたユーザーオブジェクト
   */
  async remove(id: string): Promise<User> {
    try {
      return await this.prisma.t_users.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`ユーザー ID ${id} が見つかりません`);
      }
      throw error;
    }
  }
}