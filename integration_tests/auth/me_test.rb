require_relative "../test_helper"

class MeTest < Minitest::Test
  def test_me_returns_current_user
    token, payload = access_token_for

    response = get_me(token)

    assert_equal 200, response.status, "GET /auth/me failed: #{response.body}"

    body = json_body(response)

    assert_equal payload[:login], body["login"]
    assert_equal payload[:email], body["email"]
  end
end