module ApiHelper
  BASE_URL = "http://localhost:3000"

  def connection
    @connection ||= Faraday.new(url: BASE_URL) do |f|
      f.headers["Content-Type"] = "application/json"
      f.adapter Faraday.default_adapter
    end
  end

  def json_body(response)
    JSON.parse(response.body)
  end

  def unique_user_attrs
    login = "user_#{SecureRandom.hex(4)}"

    {
      login: login,
      email: "#{login}@mail.ry",
      password: "mymail@mail.ry",
      age: 18,
      description: "test user"
    }
  end

  def register_user(attrs = {})
    payload = unique_user_attrs.merge(attrs)

    response = connection.post("/auth/register") do |req|
      req.body = JSON.generate(payload)
    end

    [response, payload]
  end

  def sign_in_user(login:, password:)
    connection.post("/auth/sign_in") do |req|
      req.body = JSON.generate({
        login: login,
        password: password
      })
    end
  end

  def access_token_for(attrs = {})
    register_response, payload = register_user(attrs)
    assert_equal 201, register_response.status, "Register failed: #{register_response.body}"

    sign_in_response = sign_in_user(
      login: payload[:login],
      password: payload[:password]
    )
    assert_equal 200, sign_in_response.status, "Sign in failed: #{sign_in_response.body}"

    body = json_body(sign_in_response)
    token = body["accessToken"]

    refute_nil token, "accessToken missing"
    refute_empty token.to_s, "accessToken is empty"

    [token, payload]
  end

  def get_me(token)
    connection.get("/auth/me") do |req|
      req.headers["Authorization"] = "Bearer #{token}"
    end
  end

  def get_users(params = {}, headers = {})
    connection.get("/users") do |req|
      req.headers["Authorization"] = "Bearer #{headers[:token]}"
      req.params = params
    end
  end
end