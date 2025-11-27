export async function GET() {
    const users = {username: "123"}; // 模拟数据库调用
    return Response.json(users);
}