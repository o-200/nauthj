require_relative "../test_helper"

class IndexTest < Minitest::Test
  def test_users_index_returns_data_with_auth
    response, _payload = register_user
    assert_equal 201, response.status

    body = json_body(response)
    token = body["accessToken"]

    refute_nil token
    refute_empty token

    users = get_users({}, { token: token })
    body = JSON.parse(users.body)

    assert body.key?("data"), "Response should contain data"
    assert body.key?("nextCursor"), "Response should contain nextCursor"

    users = body["data"]

    assert_kind_of Array, users
    refute_empty users

    # 4. проверка структуры пользователя
    user = users.first

    expected_keys = %w[
      id login email password age description
      refreshToken createdAt updatedAt
    ]

    expected_keys.each do |key|
      assert user.key?(key), "User should contain key #{key}"
    end
  end

  def test_users_index_requires_auth
    users = get_users

    assert_equal 401, users.status, "Expected 401 without token"
  end

  def test_users_index_with_cursor
    response, _payload = register_user

    token = json_body(response)["accessToken"]

    body = JSON.parse(get_users(params = {}, headers = {token: token}).body)
    next_cursor = body["nextCursor"]

    refute_nil next_cursor

    # второй запрос с курсором
    response = get_users(params = { cursor: next_cursor }, headers = {token: token})

    assert_equal 200, response.status

    body = JSON.parse(response.body)

    assert body.key?("data")
    assert_kind_of Array, body["data"]
  end

  private

  def json_body(response)
    JSON.parse(response.body)
  end
end