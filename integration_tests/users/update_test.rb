require_relative "../test_helper"

class IndexTest < Minitest::Test
  def test_update_user
    response, _payload = register_user
    assert_equal 201, response.status

    body = json_body(response)
    token = body["accessToken"]

    refute_nil token
    refute_empty token

    me_req = get_me(token)
    assert_equal 200, me_req.status, "Expected 200 when user registered before update"
    # register done

    payload_update = _payload.clone
    payload_update["login"] = SecureRandom.hex

    update_req = update_me(token, payload_update)
    body = JSON.parse(update_req.body)

    assert_equal 200, update_req.status

    me_req = get_me(token)
    assert_equal payload_update, me_req.body
  end

  private

  def json_body(response)
    JSON.parse(response.body)
  end
end