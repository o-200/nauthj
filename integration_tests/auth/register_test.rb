require_relative "../test_helper"

class RegisterTest < Minitest::Test
  def test_register_returns_201_and_tokens
    response, _payload = register_user

    assert_equal 201, response.status, "Expected 201, got #{response.status}. Body: #{response.body}"

    body = json_body(response)

    assert body.key?("accessToken"), "Response body does not contain accessToken"
    assert body.key?("refreshToken"), "Response body does not contain refreshToken"

    refute_empty body["accessToken"].to_s
    refute_empty body["refreshToken"].to_s
  end
end